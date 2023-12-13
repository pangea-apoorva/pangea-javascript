import { FC } from "react";
import { Stack, Typography } from "@mui/material";

import { AuthFlowComponentProps } from "@src/features/AuthFlow/types";
import OtpForm from "../OtpForm";
import { BodyText } from "@src/components/core/Text";

const AuthEmailOtp: FC<AuthFlowComponentProps> = (props) => {
  const { data } = props;

  return (
    <Stack gap={1}>
      <BodyText>Enter the code sent to your email.</BodyText>
      {data.phase === "phase_one_time" && (
        <Typography variant="body2">{data.email}</Typography>
      )}
      <OtpForm {...props} otpType="email_otp" />
    </Stack>
  );
};

export default AuthEmailOtp;
