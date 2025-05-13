export interface SessionCreate {
  creatorId: string;
  sessionName: string;
  tasks: [
    {
      name: string;
      description: string;
    }
  ];
}
