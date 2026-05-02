import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: "https://9eb8d25395e661cbc902381b1d723cb4@o4511259394834432.ingest.us.sentry.io/4511259396800512",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});