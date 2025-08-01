terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "bens-seguros"
}

variable "cloud_provider" {
  description = "Cloud provider (aws, azure, gcp)"
  type        = string
  default     = "aws"
  
  validation {
    condition     = contains(["aws", "azure", "gcp"], var.cloud_provider)
    error_message = "Cloud provider must be one of: aws, azure, gcp."
  }
}

variable "region" {
  description = "Cloud provider region"
  type        = string
  default     = "us-east-1"
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
  
  resource_prefix = "${var.project_name}-${var.environment}"
}

# AWS Resources
module "aws_infrastructure" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  source = "./modules/aws"
  
  environment         = var.environment
  project_name        = var.project_name
  resource_prefix     = local.resource_prefix
  region             = var.region
  database_password  = var.database_password
  jwt_secret         = var.jwt_secret
  
  tags = local.common_tags
}

# Azure Resources
module "azure_infrastructure" {
  count  = var.cloud_provider == "azure" ? 1 : 0
  source = "./modules/azure"
  
  environment         = var.environment
  project_name        = var.project_name
  resource_prefix     = local.resource_prefix
  location           = var.region
  database_password  = var.database_password
  jwt_secret         = var.jwt_secret
  
  tags = local.common_tags
}

# GCP Resources
module "gcp_infrastructure" {
  count  = var.cloud_provider == "gcp" ? 1 : 0
  source = "./modules/gcp"
  
  environment       = var.environment
  project_name      = var.project_name
  resource_prefix   = local.resource_prefix
  region           = var.region
  database_password = var.database_password
  jwt_secret       = var.jwt_secret
  
  labels = local.common_tags
}

# Outputs
output "api_endpoint" {
  description = "API endpoint URL"
  value = var.cloud_provider == "aws" ? (
    length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].api_endpoint : null
  ) : var.cloud_provider == "azure" ? (
    length(module.azure_infrastructure) > 0 ? module.azure_infrastructure[0].api_endpoint : null
  ) : var.cloud_provider == "gcp" ? (
    length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].api_endpoint : null
  ) : null
}

output "database_endpoint" {
  description = "Database endpoint"
  value = var.cloud_provider == "aws" ? (
    length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].database_endpoint : null
  ) : var.cloud_provider == "azure" ? (
    length(module.azure_infrastructure) > 0 ? module.azure_infrastructure[0].database_endpoint : null
  ) : var.cloud_provider == "gcp" ? (
    length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].database_endpoint : null
  ) : null
  sensitive = true
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value = var.cloud_provider == "aws" ? (
    length(module.aws_infrastructure) > 0 ? module.aws_infrastructure[0].redis_endpoint : null
  ) : var.cloud_provider == "azure" ? (
    length(module.azure_infrastructure) > 0 ? module.azure_infrastructure[0].redis_endpoint : null
  ) : var.cloud_provider == "gcp" ? (
    length(module.gcp_infrastructure) > 0 ? module.gcp_infrastructure[0].redis_endpoint : null
  ) : null
  sensitive = true
}