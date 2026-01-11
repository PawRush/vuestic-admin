import * as cdk from 'aws-cdk-lib'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as pipelines from 'aws-cdk-lib/pipelines'
import { Construct } from 'constructs'
import { FrontendStack } from './frontend-stack'

export interface PipelineStackProps extends cdk.StackProps {
  codeConnectionArn: string
  repositoryName: string
  branchName: string
}

export class PipelineStack extends cdk.Stack {
  public readonly pipeline: pipelines.CodePipeline

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props)

    const source = pipelines.CodePipelineSource.connection(
      props.repositoryName,
      props.branchName,
      {
        connectionArn: props.codeConnectionArn,
        triggerOnPush: true,
      }
    )

    const synth = new pipelines.ShellStep('Synth', {
      input: source,
      commands: [
        'npm install',
        'npm run lint',
        'npm run build',
        'cd infra',
        'npm install',
        'npm run build',
        `npx -y cdk synth --context codeConnectionArn=${props.codeConnectionArn} --context repositoryName=${props.repositoryName} --context branchName=${props.branchName}`,
      ],
      primaryOutputDirectory: 'infra/cdk.out',
    })

    this.pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'VuesticAdminPipeline',
      selfMutation: true,
      pipelineType: codepipeline.PipelineType.V2,
      synth,
      synthCodeBuildDefaults: {
        buildEnvironment: {
          computeType: codebuild.ComputeType.MEDIUM,
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        partialBuildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              'runtime-versions': {
                nodejs: 'latest',
              },
            },
          },
        }),
      },
    })

    // Add production deployment stage
    const deployStage = new cdk.Stage(this, 'Deploy', {
      env: { account: this.account, region: this.region },
    })

    new FrontendStack(deployStage, 'VuesticAdminFrontend-prod', {
      stackName: 'VuesticAdminFrontend-prod',
      environment: 'prod',
      buildOutputPath: '../dist',
    })

    this.pipeline.addStage(deployStage)

    cdk.Tags.of(this).add('Stack', 'Pipeline')
    cdk.Tags.of(this).add('aws-mcp:deploy:sop', 'setup-codepipeline')

    new cdk.CfnOutput(this, 'PipelineName', {
      value: 'VuesticAdminPipeline',
      description: 'CodePipeline Name',
      exportName: 'VuesticAdminPipelineName',
    })

    new cdk.CfnOutput(this, 'PipelineURL', {
      value: `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/VuesticAdminPipeline/view`,
      description: 'CodePipeline Console URL',
      exportName: 'VuesticAdminPipelineURL',
    })
  }
}
