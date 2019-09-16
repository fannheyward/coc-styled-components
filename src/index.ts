import { ExtensionContext, extensions, workspace, WorkspaceConfiguration } from 'coc.nvim';

const typeScriptExtensionId = 'coc-tsserver';
const pluginId = 'typescript-styled-plugin';
const configurationSection = 'styled-components';

interface SynchronizedConfiguration {
  tags?: ReadonlyArray<string>;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const tsExtension = extensions.getExtension(typeScriptExtensionId).extension;
  if (!tsExtension) {
    return;
  }

  await tsExtension.activate();
  if (!tsExtension.exports) {
    return;
  }

  const api = tsExtension.exports;
  if (!api) {
    return;
  }

  workspace.onDidChangeConfiguration(
    e => {
      if (e.affectsConfiguration(configurationSection)) {
        synchronizeConfiguration(api);
      }
    },
    null,
    context.subscriptions
  );

  synchronizeConfiguration(api);
}

function synchronizeConfiguration(api: any): void {
  if (!api) return;
  api.configurePlugin(pluginId, getConfiguration());
}

function getConfiguration(): SynchronizedConfiguration {
  const config = workspace.getConfiguration(configurationSection);
  const outConfig: SynchronizedConfiguration = {};

  withConfigValue<string[]>(config, 'tags', tags => {
    outConfig.tags = tags;
  });
  // TODO

  return outConfig;
}

function withConfigValue<T>(config: WorkspaceConfiguration, key: string, withValue: (value: T) => void): void {
  const configSetting = config.inspect(key);
  if (!configSetting) {
    return;
  }

  const value = config.get<T | undefined>(key, undefined);
  if (typeof value !== 'undefined') {
    withValue(value);
  }
}
