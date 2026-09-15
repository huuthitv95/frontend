// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Autocomplete, Box, createFilterOptions, debounce, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSearchUser } from "../../../../api/api.ts";
import { User } from "../../../../api/user.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { NoLabelFilledTextField } from "../../../Common/StyledComponents.tsx";
import UserAvatar from "../../../Common/User/UserAvatar.tsx";
import UserBadge from "../../../Common/User/UserBadge.tsx";
import { PropsContentProps } from "./CustomPropsItem.tsx";

const UserPropsContent = ({ prop, onChange, loading, readOnly, fullSize }: PropsContentProps) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<readonly User[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const dispatch = useAppDispatch();

  // Parse the stored user ID from prop.value
  const userId = prop.value;

  useEffect(() => {
    if (userId && !selectedUser) {
      // If we have a user ID but no selected user, we need to fetch the user
      // For now, we'll just store the ID and let UserBadge handle the loading
      setSelectedUser(null);
    } else if (!userId && selectedUser) {
      setSelectedUser(null);
    }
  }, [userId, selectedUser]);

  const fetch = useMemo(
    () =>
      debounce((request: { input: string }, callback: (results?: readonly User[]) => void) => {
        if (request.input.length < 2) {
          callback([]);
          return;
        }
        setOptionsLoading(true);
        dispatch(getSearchUser(request.input))
          .then((results) => {
            callback(results);
          })
          .finally(() => {
            setOptionsLoading(false);
          });
      }, 400),
    [dispatch],
  );

  useEffect(() => {
    let active = true;

    if (inputValue === "" || inputValue.length < 2) {
      setOptions([]);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: readonly User[]) => {
      if (active) {
        let newOptions: readonly User[] = [];

        if (results) {
          newOptions = results;
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  const filterOptions = useMemo(() => {
    return createFilterOptions<User>({
      stringify: (option) => option.nickname + " " + (option.email ?? option.id),
    });
  }, []);

  const handleUserSelect = (user: User | null) => {
    setSelectedUser(user);
    const newValue = user?.id || "";
    if (newValue !== prop.value) {
      onChange(newValue);
    }
    setInputValue("");
  };

  const handleUserRemove = () => {
    setSelectedUser(null);
    onChange("");
  };

  if (readOnly) {
    if (!userId) {
      return null;
    }
    return <UserBadge sx={{ width: 20, height: 20 }} uid={userId} textProps={{ variant: "body2" }} />;
  }

  if (userId && !selectedUser) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <UserBadge sx={{ width: 20, height: 20 }} uid={userId} textProps={{ variant: "body2" }} />
        <Typography
          variant="body2"
          color="error"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={handleUserRemove}
        >
          {t("application:fileManager.delete")}
        </Typography>
      </Box>
    );
  }

  if (selectedUser) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <UserBadge sx={{ width: 20, height: 20 }} user={selectedUser} textProps={{ variant: "body2" }} />
        <Typography
          variant="body2"
          color="error"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={handleUserRemove}
        >
          {t("application:fileManager.delete")}
        </Typography>
      </Box>
    );
  }

  return (
    <Autocomplete
      options={options}
      filterOptions={filterOptions}
      loading={optionsLoading}
      value={null}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(_event, newValue) => {
        if (newValue) {
          handleUserSelect(newValue);
        }
      }}
      getOptionLabel={(option) => option.nickname}
      noOptionsText={
        inputValue.length < 2 ? t("application:fileManager.typeToSearch") : t("application:modals.noResults")
      }
      renderOption={(props, option) => (
        <li {...props}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar user={option} />
            <Box>
              <Typography variant="body2">{option.nickname}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.email ?? option.id}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <NoLabelFilledTextField
          {...params}
          sx={{
            "& .MuiAutocomplete-root .MuiFilledInput-root": {
              pt: 1,
            },
          }}
          variant="filled"
          placeholder={t("application:fileManager.searchUser")}
          disabled={loading}
          fullWidth
          fullSize={fullSize}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      ListboxProps={{
        style: {
          maxHeight: "200px",
        },
      }}
    />
  );
};

export default UserPropsContent;
