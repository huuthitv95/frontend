// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Alert, Button, Stack } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PolicyLoadBalance, StoragePolicy } from "../../../../../api/dashboard";
import { PolicyType } from "../../../../../api/explorer";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import PolicySelectionInput from "../../../Group/EditGroup/PolicySelectionInput";
import { NoMarginHelperText } from "../../../Settings/Settings";
import { AddWizardProps } from "../../AddWizardDialog";

const LoadBalanceWizard = ({ onSubmit }: AddWizardProps) => {
  const { t } = useTranslation("dashboard");
  const formRef = useRef<HTMLFormElement>(null);
  const [policy, setPolicy] = useState<StoragePolicy>({
    id: 0,
    node_id: 0,
    name: "",
    type: PolicyType.load_balance,
    settings: {},
    edges: {
      policy_load_balance: [],
    },
  });

  const children = useMemo(() => {
    return policy.edges.policy_load_balance?.map((p) => p.storage_policy_id) ?? [];
  }, [policy.edges]);

  const onChildrenChange = (value: number[]) => {
    setPolicy({
      ...policy,
      edges: {
        ...policy.edges,
        policy_load_balance: value.map(
          (id) =>
            ({
              id: 0,
              weight: 1,
              storage_policy_id: id,
              load_balance_id: 0,
            }) as PolicyLoadBalance,
        ),
      },
    });
  };

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }
    onSubmit(policy);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Alert severity="info">{t("policy.loadBalanceDes")}</Alert>
        <SettingForm title={t("policy.name")} lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            required
            value={policy.name}
            onChange={(e) => setPolicy({ ...policy, name: e.target.value })}
          />
          <NoMarginHelperText>{t("policy.policyName")}</NoMarginHelperText>
        </SettingForm>
        <SettingForm title={t("policy.childPolicy")} lgWidth={12}>
          <PolicySelectionInput
            value={children}
            onChange={onChildrenChange}
            filter={(p) => p.type !== PolicyType.load_balance}
          />
          <NoMarginHelperText>{t("policy.childPolicyDes")}</NoMarginHelperText>
        </SettingForm>
      </Stack>
      <Button
        disabled={children.length === 0}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        {t("policy.create")}
      </Button>
    </form>
  );
};

export default LoadBalanceWizard;
