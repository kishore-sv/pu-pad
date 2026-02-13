export type PadRecord = {
  id: string;
  padHash: string;
  encryptedContent: string;
  salt: string;
  iv: string;
  authTag: string;
  wordCount: number;
  isLocked: boolean;
  selfDestructAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RevisionRecord = {
  id: string;
  padId: string;
  encryptedContent: string;
  iv: string;
  authTag: string;
  createdAt: string;
};

export type PadOpenResponse =
  | {
      status: "found";
      pad: PadRecord;
    }
  | {
      status: "not_found";
    }
  | {
      status: "expired";
    };

export type ApiErrorResponse = {
  error: string;
  code?: string;
};

