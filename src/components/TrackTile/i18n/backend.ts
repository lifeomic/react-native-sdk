import {
  BackendModule,
  InitOptions,
  ReadCallback,
  ResourceKey,
  Services,
} from 'i18next';

type BackendOptions = {
  namespaces: Record<
    string,
    (language: string) => () => ResourceKey | boolean | null | undefined
  >;
};

class NamespaceLoader implements BackendModule<BackendOptions> {
  // Silly, but it doesn't play nice with Typescript without both, maybe will get fixed in the future
  static type: 'backend' = 'backend';
  type!: 'backend';

  backendOptions?: BackendOptions;

  constructor(
    _services: Services,
    backendOptions: BackendOptions,
    _i18nextOptions: InitOptions,
  ) {
    this.backendOptions = backendOptions;
    this.init(_services, backendOptions, _i18nextOptions);
  }

  init(
    _services: Services,
    backendOptions: BackendOptions,
    _i18nextOptions: InitOptions,
  ) {
    this.backendOptions = backendOptions;
  }

  read(language: string, namespace: string, callback: ReadCallback) {
    const loadTarget = this.backendOptions?.namespaces[namespace];

    if (!loadTarget) {
      return callback(new Error(`Unable to find namespace ${namespace}`), null);
    }

    const data = loadTarget?.(language);

    if (data) {
      callback(null, data());
    } else {
      return callback(
        new Error(`Unsupported language ${language} in ${namespace}`),
        null,
      );
    }
  }
}

export { NamespaceLoader };
