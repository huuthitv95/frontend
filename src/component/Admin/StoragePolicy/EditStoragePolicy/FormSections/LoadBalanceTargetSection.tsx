// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Collapse, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransitionGroup } from "react-transition-group";
import { getStoragePolicyList } from "../../../../../api/api";
import { PolicyLoadBalance, StoragePolicy } from "../../../../../api/dashboard";
import { PolicyType } from "../../../../../api/explorer";
import { useAppDispatch } from "../../../../../redux/hooks";
import { DenseFilledTextField, SecondaryButton } from "../../../../Common/StyledComponents";
import DraggableDialog from "../../../../Dialogs/DraggableDialog";
import Add from "../../../../Icons/Add";
import Dismiss from "../../../../Icons/Dismiss";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import PolicySelectionInput from "../../../Group/EditGroup/PolicySelectionInput";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../../../Settings/Settings";
import { PolicyPropsMap } from "../../StoragePolicySetting";
import { StoragePolicySettingContext } from "../StoragePolicySettingWrapper";

const PolicyCard = styled(Box)<{ img?: string }>(({ theme, img }) => ({
  padding: theme.spacing(1, 2, 1, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.09)",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)",
  },
  "&::before": img
    ? {
        content: '""',
        position: "absolute",
        top: "-40px",
        left: "-20px",
        width: "150px",
        height: "150px",
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "rotate(10deg)",
        opacity: 0.1,
        maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
        pointerEvents: "none",
        zIndex: 0,
      }
    : {},
}));

const PolicyInfoBox = styled(Box)({
  flexGrow: 1,
  minWidth: 0,
});

const PolicyControlsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const LoadBalanceTargetSection = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const { values, setPolicy } = useContext(StoragePolicySettingContext);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>([]);
  const [policyMap, setPolicyMap] = useState<Record<number, StoragePolicy>>({});

  // Early return if not load balance policy
  if (values.type !== PolicyType.load_balance) {
    return null;
  }

  const loadBalancePolicies = useMemo(() => {
    return values.edges?.policy_load_balance || [];
  }, [values.edges?.policy_load_balance]);

  // Load all policies to get names and types
  useEffect(() => {
    dispatch(getStoragePolicyList({ page: 1, page_size: 1000, order_by: "id", order_direction: "asc" })).then((res) => {
      setPolicyMap(
        res.policies.reduce(
          (acc, policy) => {
            acc[policy.id] = policy;
            return acc;
          },
          {} as Record<number, StoragePolicy>,
        ),
      );
    });
  }, [dispatch]);

  const handleWeightChange = useCallback(
    (index: number, newWeight: string) => {
      const weight = parseInt(newWeight) || 0;
      setPolicy((p: StoragePolicy) => {
        const newLoadBalancePolicies = [...(p.edges?.policy_load_balance || [])];
        newLoadBalancePolicies[index] = {
          ...newLoadBalancePolicies[index],
          weight,
        };
        return {
          ...p,
          edges: {
            ...p.edges,
            policy_load_balance: newLoadBalancePolicies,
          },
        };
      });
    },
    [setPolicy],
  );

  const handleDeletePolicy = useCallback(
    (index: number) => {
      setPolicy((p: StoragePolicy) => {
        const newLoadBalancePolicies = [...(p.edges?.policy_load_balance || [])];
        newLoadBalancePolicies.splice(index, 1);
        return {
          ...p,
          edges: {
            ...p.edges,
            policy_load_balance: newLoadBalancePolicies,
          },
        };
      });
    },
    [setPolicy],
  );

  const handleAddPolicies = useCallback(() => {
    const newPolicies: PolicyLoadBalance[] = selectedPolicies.map((policyId) => ({
      id: 0,
      weight: 1,
      storage_policy_id: policyId,
      load_balance_id: values.id,
    }));

    setPolicy((p: StoragePolicy) => {
      const existingPolicies = p.edges?.policy_load_balance || [];
      const existingPolicyIds = existingPolicies.map((lp) => lp.storage_policy_id);
      const filteredNewPolicies = newPolicies.filter((np) => !existingPolicyIds.includes(np.storage_policy_id));

      return {
        ...p,
        edges: {
          ...p.edges,
          policy_load_balance: [...existingPolicies, ...filteredNewPolicies],
        },
      };
    });

    setSelectedPolicies([]);
    setAddDialogOpen(false);
  }, [selectedPolicies, values.id, setPolicy]);

  const availablePolicies = useMemo(() => {
    const existingPolicyIds = loadBalancePolicies.map((lp) => lp.storage_policy_id);
    return (policyId: StoragePolicy) =>
      policyId.type !== PolicyType.load_balance && !existingPolicyIds.includes(policyId.id);
  }, [loadBalancePolicies]);

  return (
    <SettingSection>
      <Typography variant="h6" gutterBottom>
        {t("policy.childPolicy")}
      </Typography>
      <SettingSectionContent>
        <Stack spacing={1}>
          <SettingForm lgWidth={5}>
            {loadBalancePolicies.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1, maxHeight: 440, overflow: "auto" }}>
                <TransitionGroup>
                  {loadBalancePolicies.map((lbPolicy, index) => {
                    const policy = policyMap[lbPolicy.storage_policy_id];
                    const isDisabled = !lbPolicy.weight;
                    return (
                      <Collapse key={index}>
                        <PolicyCard
                          sx={{ opacity: isDisabled ? 0.5 : 1, mb: 1 }}
                          img={policy ? PolicyPropsMap[policy.type].img : undefined}
                        >
                          <PolicyInfoBox>
                            <Typography variant="body2" color={isDisabled ? "text.disabled" : "text.primary"} noWrap>
                              {policy?.name || `Policy ${lbPolicy.storage_policy_id}`}
                            </Typography>
                            <Typography variant="body2" color={isDisabled ? "text.disabled" : "text.secondary"} noWrap>
                              {policy ? t(`policy.${policy.type}`) : "Unknown"}
                            </Typography>
                          </PolicyInfoBox>
                          <PolicyControlsBox>
                            <DenseFilledTextField
                              type="number"
                              variant="filled"
                              label={t("policy.weight")}
                              size="small"
                              value={lbPolicy.weight ?? 0}
                              onChange={(e) => handleWeightChange(index, e.target.value)}
                              inputProps={{ min: 0 }}
                              sx={{ width: 80 }}
                            />
                          </PolicyControlsBox>
                          <IconButton onClick={() => handleDeletePolicy(index)} size="small">
                            <Dismiss fontSize="small" />
                          </IconButton>
                        </PolicyCard>
                      </Collapse>
                    );
                  })}
                </TransitionGroup>
              </Stack>
            )}
          </SettingForm>
          <Box>
            <SecondaryButton variant="contained" startIcon={<Add />} onClick={() => setAddDialogOpen(true)}>
              {t("policy.addTargetPolicy")}
            </SecondaryButton>
          </Box>
        </Stack>
      </SettingSectionContent>

      {/* Add Policy Dialog */}
      <DraggableDialog
        dialogProps={{
          open: addDialogOpen,
          maxWidth: "sm",
          fullWidth: true,
          onClose: () => setAddDialogOpen(false),
        }}
        showActions
        showCancel
        onAccept={handleAddPolicies}
        disabled={selectedPolicies.length === 0}
      >
        <DialogTitle>{t("policy.addTargetPolicy")}</DialogTitle>
        <DialogContent>
          <SettingForm title={t("policy.selectPolicies")} lgWidth={12}>
            <PolicySelectionInput value={selectedPolicies} onChange={setSelectedPolicies} filter={availablePolicies} />
            <NoMarginHelperText>{t("policy.selectPoliciesDes")}</NoMarginHelperText>
          </SettingForm>
        </DialogContent>
      </DraggableDialog>
    </SettingSection>
  );
};

export default LoadBalanceTargetSection;
