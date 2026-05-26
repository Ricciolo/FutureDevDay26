export interface SupportTicket {
  ticketId: string;
  customerId: string;
  title: string;
  description: string;
  module: string;
  severity: string;
  createdAt: string;
}

export interface CustomerContext {
  customerId: string;
  customerName: string;
  installedVersion: string;
  enabledModules: string[];
  customizations: string[];
  lastDeployment: string;
}

export interface KnownIssue {
  issueId: string;
  title: string;
  affectedVersions: string[];
  module: string;
  probableCause: string;
  relatedFiles: string[];
  suggestedTests: string[];
}

export interface KnownIssueMatch {
  issueId: string;
  title: string;
  affectedVersions: string[];
  module: string;
  probableCause: string;
  relatedFiles: string[];
  suggestedTests: string[];
}

export interface RecentLogsResult {
  customerId: string;
  module: string | undefined;
  lines: string[];
}
