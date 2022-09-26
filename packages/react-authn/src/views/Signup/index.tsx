import { FC } from "react";

import { SxProps } from "@mui/system";
import { ThemeOptions } from "@mui/material/styles";

import AuthNLayout from "../../components/Layout";
import SignupForm from "../../forms/SignupForm";

interface SignupViewProps {
  config: any;  // TODO: add shared interface
  themeOptions?: ThemeOptions;
  sx?: SxProps;
}

const SignupView: FC<SignupViewProps> = ({ 
  config, 
  themeOptions, 
  sx, 
  ...props 
}) => {
  return (
    <AuthNLayout
      logoUrl={config?.logoUrl}
      companyName={config?.orgName}
      themeOptions={themeOptions}
      sx={sx}
    >
      <SignupForm {...props} />
    </AuthNLayout>
  );
}

export default SignupView;