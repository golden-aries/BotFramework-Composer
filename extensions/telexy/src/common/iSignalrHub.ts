export interface ISignalrHub {
  /**
   *
   * @param ciMethondName  Method Name (case insensitive)
   * @param args additional parameters to match called signature
   */
  invoke(ciMethondName: string, ...args: any[]): void;
}
