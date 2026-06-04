import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { FinanceApi } from './finance-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  finance: new FinanceApi(electronAPI)
}

export type ConveyorApi = typeof conveyor
