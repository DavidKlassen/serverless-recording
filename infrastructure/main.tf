provider "aws" {
  region = "${var.aws_region}"
}

resource "aws_iam_role" "gateway_invoke_lambda" {
  name = "gateway_invoke_lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "invoke_lambda" {
  name = "invoke_lambda"
  role = "${aws_iam_role.gateway_invoke_lambda.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "lambda:InvokeFunction"
      ]
    }
  ]
}
EOF
}

resource "aws_api_gateway_rest_api" "collection_platform_api" {
  name = "Collection Platfrom API"
  description = "Collection Platfrom API provides a gateway to collection functions"
}

resource "aws_api_gateway_resource" "recordings" {
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  parent_id = "${aws_api_gateway_rest_api.collection_platform_api.root_resource_id}"
  path_part = "recordings"
}

resource "aws_api_gateway_method" "recordings_post" {
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  resource_id = "${aws_api_gateway_resource.recordings.id}"
  http_method = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "recordings_post_integration" {
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  resource_id = "${aws_api_gateway_resource.recordings.id}"
  http_method = "${aws_api_gateway_method.recordings_post.http_method}"
  type = "AWS"
  integration_http_method = "POST"
  credentials = "${aws_iam_role.gateway_invoke_lambda.arn}"
  uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${var.apex_function_uuid}/invocations"
}

resource "aws_api_gateway_method_response" "recordings_post_success" {
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  resource_id = "${aws_api_gateway_resource.recordings.id}"
  http_method = "${aws_api_gateway_method.recordings_post.http_method}"
  status_code = "200"
  response_parameters = { "method.response.header.Access-Control-Allow-Origin" = true }
}

resource "aws_api_gateway_integration_response" "recordings_post_integration_response" {
  depends_on = ["aws_api_gateway_method_response.recordings_post_success"]
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  resource_id = "${aws_api_gateway_resource.recordings.id}"
  http_method = "${aws_api_gateway_method.recordings_post.http_method}"
  status_code = "${aws_api_gateway_method_response.recordings_post_success.status_code}"
  response_parameters = { "method.response.header.Access-Control-Allow-Origin" = "'*'" }
}

module "recordings_cors" {
  source = "./modules/api-gateway-cors"
  resource_name = "recordings"
  resource_id = "${aws_api_gateway_resource.recordings.id}"
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
}

resource "aws_api_gateway_deployment" "dev" {
  depends_on = [
    "aws_api_gateway_integration.recordings_post_integration",
    "aws_api_gateway_integration_response.recordings_post_integration_response",
    "module.recordings_cors"
  ]
  rest_api_id = "${aws_api_gateway_rest_api.collection_platform_api.id}"
  stage_name = "dev"
}
