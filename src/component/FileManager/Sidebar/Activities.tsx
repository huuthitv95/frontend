// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { FileActivity, FileActivityFilter, FileResponse } from "../../../api/explorer.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import * as React from "react";
import { useCallback, useState } from "react";
import { Box, List, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import Activity from "./Activity.tsx";
import { getFileActivities } from "../../../api/api.ts";
import { DefaultButton } from "../../Common/StyledComponents.tsx";
import CaretDown from "../../Icons/CaretDown.tsx";
import { useTranslation } from "react-i18next";
import Checkmark from "../../Icons/Checkmark.tsx";

export interface ActivitiesProps {
  target: FileResponse;
}

const pageSize = 20;

const filterLabelMap = {
  [FileActivityFilter.all]: "fileManager.all",
  [FileActivityFilter.my]: "fileManager.myActivitiesOnly",
  [FileActivityFilter.updates]: "fileManager.updatesOnly",
  [FileActivityFilter.reads]: "fileManager.readsOnly",
};

const Activities = ({ target }: ActivitiesProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [nextPageToken, setNextPageToken] = useState<string | undefined>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activities, setActivities] = useState<FileActivity[]>([]);
  const [filter, setFilter] = useState("");

  const loadNextPage = useCallback(() => {
    dispatch(
      getFileActivities({
        uri: target.path,
        page_size: pageSize,
        order_direction: "desc",
        filter,
        next_page_token: nextPageToken,
      }),
    )
      .then((res) => {
        setActivities([...activities, ...res.activities]);
        if (res.pagination?.next_token) {
          setNextPageToken(res.pagination.next_token);
        } else {
          setNextPageToken(undefined);
        }
      })
      .catch(() => {
        setNextPageToken(undefined);
      });
  }, [nextPageToken, filter, target, dispatch, setActivities]);

  const setFilterValue = (filter: string) => {
    setFilter(filter);
    setNextPageToken("");
    setActivities([]);
    setAnchorEl(null);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        {Object.keys(filterLabelMap).map((option) => (
          <MenuItem dense key={option} onClick={() => setFilterValue(option)}>
            {option != filter && <ListItemText inset>{t(filterLabelMap[option])}</ListItemText>}
            {option == filter && (
              <>
                <ListItemIcon>
                  <Checkmark />
                </ListItemIcon>
                {t(filterLabelMap[option])}
              </>
            )}
          </MenuItem>
        ))}
      </Menu>
      <Stack spacing={1}>
        <Box sx={{ pt: 0.5 }}>
          <DefaultButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            endIcon={<CaretDown sx={{ fontSize: "12px!important" }} />}
            variant={"outlined"}
          >
            {t(filterLabelMap[filter])}
          </DefaultButton>
        </Box>
        <List sx={{ width: "100%", py: 0 }}>
          {activities.map((activity) => (
            <Activity key={activity.id} file={target} activity={activity} />
          ))}
          {nextPageToken != undefined && <Activity onLoad={loadNextPage} loading={true} key={nextPageToken} />}
          {nextPageToken == undefined && activities.length == 0 && (
            <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
              <Typography variant={"caption"} color={"text.secondary"}>
                {t("application:setting.listEmpty")}
              </Typography>
            </Box>
          )}
        </List>
      </Stack>
    </>
  );
};

export default Activities;
