// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import {
  Box,
  Collapse,
  debounce,
  FormControl,
  Link,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { getShareList } from "../../../../api/api";
import { DefaultPinnedShare, GroupEnt, Share } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import {
  DenseAutocomplete,
  DenseFilledTextField,
  NoWrapBox,
  NoWrapCell,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents";
import FileTypeIcon from "../../../FileManager/Explorer/FileTypeIcon";
import LinkDismiss from "../../../Icons/LinkDismiss";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../../Settings/Settings";
import { AnonymousGroupID } from "../GroupRow";
import DraggablePinnedShareRow from "./DraggablePinnedShareRow";
import { GroupSettingContext } from "./GroupSettingWrapper";

const DefaultPinnedSection = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { values, setGroup } = useContext(GroupSettingContext);

  const defaultPinned: DefaultPinnedShare[] = useMemo(
    () => values.settings?.default_pinned_shares ?? [],
    [values.settings?.default_pinned_shares],
  );

  // Cache lookup of share id -> share info (for showing file icon/name in row).
  const [idShareMap, setIdShareMap] = useState<Record<number, Share>>({});

  // Autocomplete state for "add new" picker.
  const [pickerInput, setPickerInput] = useState("");
  const [pickerOptions, setPickerOptions] = useState<number[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  // Load info for already-saved share IDs so the table can render their file name/icon.
  useEffect(() => {
    const missing = defaultPinned.map((d) => d.share_id).filter((id) => id > 0 && !idShareMap[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    dispatch(
      getShareList({
        page: 1,
        page_size: 100,
        order_by: "",
        order_direction: "desc",
        conditions: {
          share_id: missing.join(","),
        },
      }),
    )
      .then((res) => {
        if (cancelled) return;
        setIdShareMap((prev) => ({
          ...prev,
          ...(res?.shares?.reduce(
            (acc, s) => {
              acc[s.id] = s;
              return acc;
            },
            {} as Record<number, Share>,
          ) ?? {}),
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [defaultPinned, dispatch, idShareMap]);

  const fetchOptions = useMemo(
    () =>
      debounce((input: string) => {
        setPickerLoading(true);
        dispatch(
          getShareList({
            page: 1,
            page_size: 50,
            order_by: "",
            order_direction: "desc",
            conditions: {
              share_id: input,
            },
          }),
        )
          .then((res) => {
            setPickerOptions(res?.shares?.map((s) => s.id) ?? []);
            setIdShareMap((prev) => ({
              ...prev,
              ...(res?.shares?.reduce(
                (acc, s) => {
                  acc[s.id] = s;
                  return acc;
                },
                {} as Record<number, Share>,
              ) ?? {}),
            }));
          })
          .finally(() => setPickerLoading(false));
      }, 400),
    [dispatch],
  );

  useEffect(() => {
    if (pickerInput === "") {
      setPickerOptions([]);
      return;
    }
    fetchOptions(pickerInput);
  }, [pickerInput, fetchOptions]);

  const updateList = useCallback(
    (next: DefaultPinnedShare[]) => {
      setGroup((p: GroupEnt) => ({
        ...p,
        settings: {
          ...p.settings,
          default_pinned_shares: next.length ? next : undefined,
        },
      }));
    },
    [setGroup],
  );

  const moveRow = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const updated = [...defaultPinned];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      updateList(updated);
    },
    [defaultPinned, updateList],
  );

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    moveRow(idx, idx - 1);
  };
  const handleMoveDown = (idx: number) => {
    if (idx >= defaultPinned.length - 1) return;
    moveRow(idx, idx + 1);
  };

  const handleAdd = (shareId: number) => {
    if (!shareId) return;
    if (defaultPinned.find((d) => d.share_id === shareId)) return;
    updateList([...defaultPinned, { share_id: shareId }]);
  };

  const handleNameChange = (idx: number, name: string) => {
    const next = [...defaultPinned];
    next[idx] = { ...next[idx], name: name || undefined };
    updateList(next);
  };

  const handleDelete = (idx: number) => {
    const next = defaultPinned.filter((_, i) => i !== idx);
    updateList(next);
  };

  if (values?.id == AnonymousGroupID) {
    return null;
  }

  return (
    <SettingSection>
      <Typography variant="h6" gutterBottom>
        {t("group.defaultPinned")}
      </Typography>
      <SettingSectionContent>
        <SettingForm lgWidth={5}>
          <FormControl fullWidth>
            <DenseAutocomplete
              value={null}
              options={pickerOptions}
              loading={pickerLoading}
              blurOnSelect
              clearOnBlur
              onChange={(_event: any, newValue: unknown) => {
                if (typeof newValue === "number") {
                  handleAdd(newValue);
                }
              }}
              onInputChange={(_event, newInputValue) => {
                setPickerInput(newInputValue);
              }}
              filterOptions={(opts) => opts}
              getOptionDisabled={(option) => !!defaultPinned.find((d) => d.share_id === (option as number))}
              noOptionsText={t("application:modals.noResults")}
              renderOption={(props, option) => {
                const share = idShareMap[option as number];
                return (
                  <li {...props} key={option as number}>
                    <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                      {share?.edges?.file ? (
                        <FileTypeIcon name={share?.edges?.file?.name ?? ""} fileType={share?.edges?.file?.type ?? 0} />
                      ) : (
                        <LinkDismiss />
                      )}
                      <NoWrapBox
                        sx={{
                          fontSize: (theme) => theme.typography.body2.fontSize,
                          width: "100%",
                          ml: 2,
                        }}
                      >
                        {share?.edges?.file?.name ?? t("application:share.expiredLink")}
                      </NoWrapBox>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <DenseFilledTextField
                  {...params}
                  sx={{
                    "& .MuiInputBase-root.MuiOutlinedInput-root": {
                      paddingTop: theme.spacing(0.6),
                      paddingBottom: theme.spacing(0.6),
                    },
                    mt: 0,
                  }}
                  variant="outlined"
                  margin="dense"
                  placeholder={t("settings.searchShare")}
                  type="text"
                  fullWidth
                />
              )}
            />
            <NoMarginHelperText>
              <Trans
                i18nKey="group.defaultPinnedDes"
                ns={"dashboard"}
                components={[<Link component={RouterLink} to={"/admin/share"} />]}
              />
            </NoMarginHelperText>
          </FormControl>
        </SettingForm>

        <Collapse in={defaultPinned.length > 0} unmountOnExit>
          <Stack spacing={1}>
            <TableContainer component={StyledTableContainerPaper}>
              <DndProvider backend={HTML5Backend}>
                <Table sx={{ width: "100%" }} size="small">
                  <TableHead>
                    <TableRow>
                      <NoWrapCell>{t("group.pinnedShare")}</NoWrapCell>
                      <NoWrapCell>{t("group.pinnedDisplayName")}</NoWrapCell>
                      <NoWrapCell>{t("settings.actions")}</NoWrapCell>
                      <NoWrapCell></NoWrapCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {defaultPinned.map((d, idx) => {
                      const rowRef = createRef<HTMLTableRowElement>();
                      return (
                        <DraggablePinnedShareRow
                          key={`${d.share_id}-${idx}`}
                          ref={rowRef}
                          shareId={d.share_id}
                          share={idShareMap[d.share_id]}
                          name={d.name ?? ""}
                          index={idx}
                          moveRow={moveRow}
                          onNameChange={(name) => handleNameChange(idx, name)}
                          onDelete={() => handleDelete(idx)}
                          onMoveUp={() => handleMoveUp(idx)}
                          onMoveDown={() => handleMoveDown(idx)}
                          isFirst={idx === 0}
                          isLast={idx === defaultPinned.length - 1}
                          t={t}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </DndProvider>
            </TableContainer>
          </Stack>
        </Collapse>
      </SettingSectionContent>
    </SettingSection>
  );
};

export default DefaultPinnedSection;
