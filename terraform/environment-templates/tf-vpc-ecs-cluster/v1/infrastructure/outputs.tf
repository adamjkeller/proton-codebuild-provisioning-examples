output "cluster_name" {
  description = "cluster name"
  value       = module.fargate_env.cluster_name
}

output "cluster_arn" {
  description = "cluster arn"
  value       = module.fargate_env.cluster_arn
}

output "service_taskdef_execution_role" {
  description = "task execution role"
  value       = module.fargate_env.service_taskdef_execution_role
}

output "vpc_id" {
  description = "vpc id"
  value       = module.fargate_env.vpc_id
}

output "public_subnet_one_id" {
  description = "public subnet one"
  value       = module.fargate_env.public_subnet_one_id
}

output "public_subnet_two_id" {
  description = "public subnet two"
  value       = module.fargate_env.public_subnet_two_id
}

output "private_subnet_one_id" {
  description = "private subnet one"
  value       = module.fargate_env.private_subnet_one_id
}

output "private_subnet_two_id" {
  description = "private subnet two"
  value       = module.fargate_env.private_subnet_two_id
}

output "tf_state_bucket" {
  description = "Terraform state bucket name"
  value       = var.environment.inputs.tf_state_bucket
}

output "tf_state_bucket_region" {
  description = "AWS Region where state bucket resides"
  value       = var.environment.inputs.tf_state_bucket_region
}

output "aws_region" {
  description = "AWS Region where resources reside"
  value       = var.environment.inputs.aws_region
}