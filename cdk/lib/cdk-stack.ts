import {
  Stack,
  StackProps,
  aws_events,
  aws_events_targets,
  Duration,
} from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class XrpPriceAggregator extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);    

    const lambda = new Function(this, `${id}-function`, {
      code: Code.fromDockerBuild("../", {}),
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(15),
      handler: "index.handler",
      environment: {
        CURRENCY: process.env.CURRENCY!,
        TIMEOUT_SECONDS: process.env.TIMEOUT_SECONDS!,
        ENDPOINT: process.env.ENDPOINT!,
        XRPL_SOURCE_ACCOUNT: process.env.XRPL_SOURCE_ACCOUNT!,
        XRPL_SOURCE_ACCOUNT_SECRET: process.env.XRPL_SOURCE_ACCOUNT_SECRET!,
        XRPL_DESTINATION_ACCOUNT: process.env.XRPL_DESTINATION_ACCOUNT!,
      }
    });

    new aws_events.Rule(this, `${id}-dayily-event`, {
      // 毎分定期実行
      schedule: aws_events.Schedule.cron({
        minute: "*",
      }),
      targets: [
        new aws_events_targets.LambdaFunction(lambda, {
          retryAttempts: 3,
        }),
      ],
    });
  }
}
