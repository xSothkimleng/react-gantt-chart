# Code Example

```tsx
main code
```

## Type

## Column : Header Field

```ts
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
```

## Row

```ts
interface DefaultRowSetting {
  id: string | number;
  name: string;
  start: string;
  end: string;
}

export interface Row extends DefaultRowSetting {
  highlight?: boolean;
  children?: Row[];
  currentProgress?: number;
  maxProgress?: number;
  isLocked?: boolean;
  showProgressPercentage?: boolean;
  progressNumberFormat?: 'currency' | 'comma';
  [key: string]: unknown;
}
```
