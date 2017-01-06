// aws settings
variable "aws_region" {
  default = "eu-west-1"
}

// lambdas managed by apex
variable "apex_function_group-faces" {}
variable "apex_function_join" {}
variable "apex_function_reindex" {}
variable "apex_function_save-face" {}
variable "apex_function_thumb" {}
variable "apex_function_uuid" {}
