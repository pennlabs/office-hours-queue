import { App } from "cdkactions";
import { LabsApplicationStack } from "@pennlabs/kraken";

const app = new App();
new LabsApplicationStack(app, {
  djangoProjectName: 'officehoursqueue',
  dockerImageBaseName: 'office-hours-queue',
});

app.synth();
