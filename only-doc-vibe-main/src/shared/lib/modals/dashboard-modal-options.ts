export interface IDashboardRenameModalOptions {
  fileId: string;
  filename: string;
}

export interface IDashboardDeleteModalOptions {
  ids: string[];
  filename?: string;
}

export interface IDashboardShareLinkModalOptions {
  fileId: string;
  filename: string;
}

export interface IDashboardSendByEmailModalOptions {
  fileId: string;
  filename: string;
}
