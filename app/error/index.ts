
import userErrorMessage from './user';
import utilsErrorMessage from './utils';
import workErrorMessage from './work';

const globalErrorMessage = {
  ...userErrorMessage,
  ...workErrorMessage,
  ...utilsErrorMessage,
};

export type GlobalErrorMessageType = keyof typeof globalErrorMessage;

export default globalErrorMessage;
