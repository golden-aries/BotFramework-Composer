export interface ITxBotConnector {
  processActivity(botId: number, sessionUid: string, botContext: string, activity: string): Promise<void>;
}
