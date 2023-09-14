import { PropsWithChildren } from 'react';
import NavBar from './NavBar';

const PageShell: React.FC<PropsWithChildren<{ paddedBody?: boolean }>> = ({
  children,
  paddedBody,
}) => (
  <>
    <NavBar />
    <div className={paddedBody ? 'padded-body' : ''}>{children}</div>
  </>
);

export default PageShell;
