declare const itTranslation: {
  assetManager: {
    addButton: string;
    inputPlh: string;
    modalTitle: string;
    uploadTitle: string;
  };
  domComponents: {
    names: {
      [key: string]: string;
    };
  };
  deviceManager: {
    device: string;
    devices: {
      [key: string]: string;
    };
  };
  panels: {
    buttons: {
      titles: {
        [key: string]: string;
      };
    };
  };
  selectorManager: {
    label: string;
    selected: string;
    emptyState: string;
    states: {
      [key: string]: string;
    };
  };
  styleManager: {
    empty: string;
    layer: string;
    fileButton: string;
    sectors: {
      [key: string]: string;
    };
    properties: {
      [key: string]: any; // puoi definire più precisamente le proprietà se necessario
    };
  };
  traitManager: {
    empty: string;
    label: string;
    traits: {
      labels: {
        [key: string]: string;
      };
      attributes: {
        [key: string]: any; // puoi definire più precisamente le proprietà se necessario
      };
      options: {
        target: {
          [key: string]: string;
        };
      };
    };
  };
};

export default itTranslation;
