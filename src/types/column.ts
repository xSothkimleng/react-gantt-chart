interface DefaultColumnSetting {
  id: {
    name: string;
    show: boolean;
  };
  name: {
    name: string;
    show: true;
  };
  start: {
    name: string;
    show: boolean;
  };
  end: {
    name: string;
    show: boolean;
  };
}

export interface Column extends DefaultColumnSetting {
  [key: string]: {
    name: string;
    show: boolean;
  };
}
