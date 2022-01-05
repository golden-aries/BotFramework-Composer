import path from 'path';

/** helps with path comparing and transforming operations */
export class TxPath {
  /**
   * compares two path creliably even if they are malformed with mismatched end extra separators
   *  e.g. the following calls returns true:
   *  arePathsEqual(d:/temp/bots, d:\\temp\\bots)
   *  arePathsEqual(d:/temp\\bOts, d:\\temp/bots)
   *  arePathsEqual(d:////temp\\Bots, d:\\temp//bots)
   * */
  arePathsEqual(lhsPath: string, rhsPath: string): boolean {
    // sometimes path coming are malformed e.g c:/temp  vs c:\temp
    return path.normalize(lhsPath.toLowerCase()) === path.normalize(rhsPath.toLowerCase());
  }

  /**
   * returns true if child is a child of parent
   */
  isChildOf(childFullPath: string, parentFullPath: string): boolean {
    const normalizedParent = path.normalize(parentFullPath.toLowerCase());
    const normalizedChild = path.normalize(childFullPath.toLowerCase());
    return normalizedParent === path.dirname(normalizedChild);
  }
}
