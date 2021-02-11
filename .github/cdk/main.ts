import { App } from "cdkactions";
import { AutoApproveStack, LabsApplicationStack } from "@pennlabs/kraken";

const app = new App();
new LabsApplicationStack(app, {
  djangoProjectName: 'officehoursqueue',
  dockerImageBaseName: 'office-hours-queue',
});
new AutoApproveStack(app);

app.synth();
