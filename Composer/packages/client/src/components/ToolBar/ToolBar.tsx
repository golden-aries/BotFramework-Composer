// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, Fragment, useMemo } from 'react';
import formatMessage from 'format-message';
import { ActionButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { DialogInfo } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';

import { projectIdState, dispatcherState, visualEditorSelectionState } from '../../recoilModel';
import { VisualEditorAPI } from '../../pages/design/FrameAPI';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

export type IToolBarItem = {
  type: string;
  element?: any;
  text?: string;
  buttonProps?: {
    iconProps: {
      iconName: string;
    };
    onClick: () => void;
  };
  align?: string;
  dataTestid?: string;
  disabled?: boolean;
};

type ToolbarProps = {
  toolbarItems?: Array<IToolBarItem>;
  currentDialog?: DialogInfo;
  onCreateDialogComplete?: (...args: any[]) => void;
  openNewTriggerModal?: () => void;
  showSkillManifestModal?: () => void;
};

function itemList(action: IToolBarItem, index: number) {
  if (action.type === 'element') {
    return <Fragment key={index}>{action.element}</Fragment>;
  } else {
    return (
      <ActionButton
        key={index}
        css={actionButton}
        {...action.buttonProps}
        data-testid={action.dataTestid}
        disabled={action.disabled}
      >
        {action.text}
      </ActionButton>
    );
  }
}

// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export function ToolBar(props: ToolbarProps) {
  const {
    toolbarItems = [],
    currentDialog,
    onCreateDialogComplete,
    openNewTriggerModal,
    showSkillManifestModal,
    ...rest
  } = props;

  const projectId = useRecoilValue(projectIdState);
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);
  const { createDialogBegin, onboardingAddCoachMarkRef, exportToZip } = useRecoilValue(dispatcherState);

  const { actionSelected, showDisableBtn, showEnableBtn } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) {
      return {};
    }
    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));
    const showDisableBtn = selectedActions.some((x) => get(x, 'disabled') !== true);
    const showEnableBtn = selectedActions.some((x) => get(x, 'disabled') === true);
    return { actionSelected, showDisableBtn, showEnableBtn };
  }, [visualEditorSelection]);

  const left: IToolBarItem[] = [];
  const right: IToolBarItem[] = [];

  for (const item of toolbarItems) {
    switch (item.align) {
      case 'left':
        left.push(item);
        break;
      case 'right':
        right.push(item);
    }
  }

  const addNewRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  return (
    <div aria-label={formatMessage('toolbar')} css={headerSub} role="region" {...rest}>
      <div css={leftActions}>
        {window.location.href.includes('/dialogs/') && (
          <div ref={addNewRef}>
            <CommandButton
              css={actionButton}
              data-testid="AddFlyout"
              iconProps={{ iconName: 'Add' }}
              menuProps={{
                items: [
                  {
                    'data-testid': 'FlyoutNewDialog',
                    key: 'adddialog',
                    text: formatMessage('Add new dialog'),
                    onClick: () => {
                      createDialogBegin([], onCreateDialogComplete);
                    },
                  },
                  {
                    'data-testid': 'FlyoutNewTrigger',
                    key: 'addtrigger',
                    text: formatMessage(`Add new trigger on {displayName}`, {
                      displayName: currentDialog?.displayName ?? '',
                    }),
                    onClick: () => {
                      openNewTriggerModal?.();
                    },
                  },
                ],
              }}
              text={formatMessage('Add')}
            />
          </div>
        )}
        {left.map(itemList)}{' '}
        {window.location.href.includes('/dialogs/') && (
          <CommandButton
            css={actionButton}
            disabled={!actionSelected}
            iconProps={{ iconName: 'RemoveOccurrence' }}
            menuProps={{
              items: [
                {
                  key: 'disable',
                  text: formatMessage('Disable'),
                  disabled: !showDisableBtn,
                  onClick: () => {
                    VisualEditorAPI.disableSelection();
                  },
                },
                {
                  key: 'enable',
                  text: formatMessage('Enable'),
                  disabled: !showEnableBtn,
                  onClick: () => {
                    VisualEditorAPI.enableSelection();
                  },
                },
              ],
            }}
            text={formatMessage('Disable')}
          />
        )}
        {window.location.href.includes('/dialogs/') && (
          <CommandButton
            css={actionButton}
            iconProps={{ iconName: 'OpenInNewWindow' }}
            menuProps={{
              items: [
                {
                  key: 'zipexport',
                  text: formatMessage('Export assets to .zip'),
                  onClick: () => {
                    exportToZip({ projectId });
                  },
                },
                {
                  key: 'exportAsSkill',
                  text: formatMessage('Export as skill'),
                  onClick: () => {
                    showSkillManifestModal?.();
                  },
                },
              ],
            }}
            text={formatMessage('Export')}
          />
        )}
      </div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
