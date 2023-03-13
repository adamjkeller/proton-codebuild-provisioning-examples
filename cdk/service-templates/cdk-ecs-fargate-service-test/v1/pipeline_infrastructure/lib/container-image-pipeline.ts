import {
  Stack,
  StackProps,
  SecretValue,
  RemovalPolicy,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as ecr from "aws-cdk-lib/aws-ecr";
import input from "../proton-inputs.json";

export class ContainerImageBuildPipeline extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const serviceOutputs: { [index: string]: any } = input.service;
    const pipelineInputs: { [index: string]: any } = input.pipeline.inputs;
    const serviceInstances: { [index: string]: any } = input.service_instances;
    const stackName = props.stackName ?? serviceOutputs.name;
    const repoProvider: string = pipelineInputs.repoProvider;

    const buildPipeline = new codepipeline.Pipeline(this, "BuildPipeline", {});
    const sourceOutput = new codepipeline.Artifact();
    let sourceAction;

    if (repoProvider.toLowerCase() === "codecommit") {
      sourceAction = new codepipeline_actions.CodeCommitSourceAction({
        actionName: "CodeCommitSource",
        output: sourceOutput,
        repository: codecommit.Repository.fromRepositoryName(
          this,
          "CCRepo",
          pipelineInputs.gitRepo
        ),
        branch: pipelineInputs.branch,
      });
    } else if (repoProvider.toLowerCase() === "github") {
      sourceAction = new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHubSource",
        oauthToken: SecretValue.secretsManager("my-github-token"),
        output: sourceOutput,
        owner: pipelineInputs.githubOwner,
        repo: pipelineInputs.gitRepo,
        branch: pipelineInputs.branch,
      });
    } else {
      throw new Error("Unable to proceed as no git provider was selected");
    }

    const ecrRepo = new ecr.Repository(this, "ECRRepo", {
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new CfnOutput(this, "RepositoryURI", {
      value: ecrRepo.repositoryUri,
    });

    const buildProject = new codebuild.PipelineProject(this, "BuildProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(
        "buildspec-docker-build.yml"
      ),
      environmentVariables: {
        IMAGE_REPO_NAME: {
          value: ecrRepo.repositoryUri,
        },
      },
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "CodeBuild",
      project: buildProject,
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()],
    });

    buildPipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    buildPipeline.addStage({
      stageName: "Build",
      actions: [buildAction],
    });

    // Two options:
    // Single pipeline that deploys the build artifacts across environments
    // Pipeline per service instance

    // Single pipeline approach

    // Prod services go last after approval step
    //const stagingWave = [];
    //const prodWave = [];
    //const deployProject = new codebuild.PipelineProject(
    //  this,
    //  "DeployProject",
    //  {}
    //);

    //const deployAction = new codepipeline_actions.CodeBuildAction({
    //  actionName: "Deploy",
    //  project: deployProject,
    //  input: sourceOutput,
    //  outputs: [new codepipeline.Artifact()],
    //});

    //for (const service in serviceInstances) {
    //  const serviceDetails = serviceInstances[service];
    //  if (serviceDetails.inputs.envType === "dev") {
    //    buildPipeline.addStage({
    //      stageName: `Deploy${serviceDetails.service.name}`,
    //      actions: [buildAction],
    //    });
    //  }
    //}
  }
}
