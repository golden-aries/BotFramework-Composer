// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-non-literal-fs-filename */
import { IExtensionRegistration } from '@botframework-composer/types';
import { IRuntime } from '../common/iRuntime';

export default async (composer: IExtensionRegistration, runtime: IRuntime): Promise<void> => {
  /**
   * these are the new 2.0 adaptive runtime definitions
   */
  composer.addRuntimeTemplate(runtime);
};
