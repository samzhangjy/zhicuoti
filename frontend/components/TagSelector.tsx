import { TagPublic, tagSearchTagsRoute } from "@/client";
import {
  CheckIcon,
  Combobox,
  Group,
  Loader,
  Pill,
  PillsInput,
  PillsInputProps,
  useCombobox,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export function TagSelector({
  onChange: setValue,
  value,
  subjectId,
  ...props
}: PillsInputProps & {
  subjectId: string;
  value?: string[];
  onChange: (value: string[]) => unknown;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");
  const [data, setData] = useState<TagPublic[]>([]);
  const [addedData, setAddedData] = useState<{ name: string; id: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const exactOptionMatch = [...data, ...addedData].some(
    (item) => item.name === search
  );

  const handleValueSelect = async (val: string) => {
    setSearch("");

    if (val === "$create") {
      setAddedData([
        ...addedData,
        { name: search, id: Math.random().toString() },
      ]);
      setValue([...value!, search]);
    } else {
      if (value!.includes(val)) {
        setValue(value!.filter((v) => v !== val));
      } else {
        setValue([...value!, val]);
      }
    }
  };

  const handleValueRemove = (val: string) =>
    setValue(value!.filter((v) => v !== val));

  const fetchOptions = async (query: string) => {
    setLoading(true);
    const { data, error } = await tagSearchTagsRoute({
      query: {
        query,
        subject_id: subjectId,
      },
    });
    if (error) {
      notifications.show({
        title: "错误",
        message: error.detail?.toString(),
        color: "red",
      });
      setLoading(false);
      return;
    }
    setData(data);
    setLoading(false);
  };

  const values = value!.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  const options = [
    ...data,
    ...addedData.filter((tag) =>
      tag.name.toLowerCase().includes(search.trim().toLowerCase())
    ),
  ].map((tag) => (
    <Combobox.Option
      value={tag.name}
      key={tag.id}
      active={value!.includes(tag.name)}
    >
      <Group gap="sm">
        {value!.includes(tag.name) ? <CheckIcon size={12} /> : null}
        <span>{tag.name}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={loading && <Loader size={18} />}
          {...props}
        >
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => {
                  fetchOptions("");
                  combobox.openDropdown();
                }}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="搜索标签"
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  fetchOptions(event.currentTarget.value);
                  combobox.resetSelectedOption();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value![value!.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options}

          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$create">
              + 创建标签 {search}
            </Combobox.Option>
          )}

          {exactOptionMatch &&
            search.trim().length > 0 &&
            options.length === 0 && <Combobox.Empty>未找到结果</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
