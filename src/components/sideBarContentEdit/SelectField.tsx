import { UI_CONFIG } from "@/config/ui-config";
import { Button, Flex, IconButton, Select, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BiPencil, BiX } from "react-icons/bi";
import { FaSortDown } from "react-icons/fa";
import slugify from "slugify";
import SelectBox, { OnlySelectBox } from "./selectbox";

type Props = {
  name: string;
  editedData: string[];
  // eslint-disable-next-line no-unused-vars
  updateData: (x: string[]) => void;
  autoCompleteList: Array<AutoCompleteData>;
  userCanAddToList?: boolean;
};

export type AutoCompleteData = {
  slug: string;
  value: string;
};

export type SelectEditState = {
  idx: number;
  value: string;
  autoCompleteValue: string;
};

const initialEditState: SelectEditState = {
  idx: -1,
  value: "",
  autoCompleteValue: "",
};

const SelectField = ({
  name,
  editedData,
  updateData,
  autoCompleteList,
}: Props) => {
  const [isNew, setIsNew] = useState(false);

  const [editState, setEditState] = useState<SelectEditState>(initialEditState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    setEditState((prev) => ({
      ...prev,
      value: inputValue,
      autoCompleteValue: "",
    }));
  };

  const handleUpdateEdit = (idx: number, name?: string) => {
    // cancel editing
    if (name && name === "cancel") {
      toggleEdit(idx);
      return;
    }
    let updatedSpeakers = [...editedData];
    // delete an item from list if item is blank
    if (!editState.value.trim()) {
      updatedSpeakers.splice(idx, 1);
    } else {
      updatedSpeakers[idx] = editState.value;
    }
    updateData(updatedSpeakers);
    toggleEdit(idx);
  };

  const handleNewSpeaker = (idx: number, name?: string) => {
    setIsNew(false);
    // cancel editing
    if (name && name === "cancel") {
      return;
    }
    let updatedSpeakers = [...editedData];
    if (!editState.value) {
      return;
    } else {
      updatedSpeakers.push(editState.value);
    }
    updateData(updatedSpeakers);
  };

  const handleAutoCompleteSelect = (data: AutoCompleteData) => {
    setEditState((prev) => ({
      ...prev,
      value: data.value,
      autoCompleteValue: data.value,
    }));
  };

  const toggleEdit = (idx: number) => {
    // ensure only one select at a time
    if (idx !== -1 && isNew) {
      setIsNew(false);
    }
    // reset edit state after toggle off and fill in edit state on toggle on
    editState.idx === idx
      ? setEditState(initialEditState)
      : setEditState((prev) => ({
          ...prev,
          idx,
          value: editedData[idx] ?? "",
        }));
  };

  const addNewSpeaker = () => {
    toggleEdit(-1);
    setIsNew(true);
  };

  return (
    <>
      {editedData?.map((speaker: string, idx: number) => {
        return idx === editState.idx ? (
          <SelectBox
            key={speaker}
            idx={idx}
            name={name}
            editState={editState}
            handleInputChange={handleInputChange}
            handleUpdateEdit={handleUpdateEdit}
            autoCompleteList={autoCompleteList}
            handleAutoCompleteSelect={handleAutoCompleteSelect}
          />
        ) : (
          <Flex
            key={`${speaker}-idx-${idx}`}
            justifyContent="space-between"
            gap={1}
            alignItems="center"
          >
            <Text fontSize="14px">{speaker}</Text>
            <IconButton
              fontSize="16px"
              p="6px"
              size="sm"
              minW="auto"
              h="auto"
              variant="ghost"
              onClick={() => toggleEdit(idx)}
              aria-label="edit speaker"
              icon={<BiPencil />}
            />
          </Flex>
        );
      })}
      {isNew ? (
        <SelectBox
          idx={-1}
          name={name}
          editState={editState}
          handleInputChange={handleInputChange}
          handleUpdateEdit={handleNewSpeaker}
          autoCompleteList={autoCompleteList}
          handleAutoCompleteSelect={handleAutoCompleteSelect}
        />
      ) : (
        <Button
          ml="auto"
          variant="ghost"
          colorScheme="blue"
          size="sm"
          onClick={addNewSpeaker}
        >
          <Text textTransform="uppercase" fontSize="12px">
            Add {name} +
          </Text>
        </Button>
      )}
    </>
  );
};

export default SelectField;

export const OnlySelectField = ({
  name,
  editedData,
  updateData,
  autoCompleteList,
  userCanAddToList,
}: Props) => {
  const handleAddItem = (value: string) => {
    let updatedList = [...editedData];
    updatedList.push(value);
    updateData(updatedList);
  };

  const handleRemoveItem = (idx: number) => {
    let updatedList = [...editedData];
    updatedList.splice(idx, 1);
    updateData(updatedList);
  };

  const handleAutoCompleteSelect = (data: AutoCompleteData) => {
    handleAddItem(data.value);
  };

  // remove previuosly selected option from list
  const newAutoCompleteList =
    autoCompleteList.length > UI_CONFIG.MAX_AUTOCOMPLETE_LENGTH_TO_FILTER
      ? autoCompleteList
      : autoCompleteList.filter((item) => !editedData.includes(item.value));

  return (
    <>
      <OnlySelectBox
        idx={-1}
        name={name}
        addItem={userCanAddToList ? handleAddItem : undefined}
        autoCompleteList={newAutoCompleteList}
        handleAutoCompleteSelect={handleAutoCompleteSelect}
      />
      {editedData?.map((speaker: string, idx: number) => {
        return (
          <Flex
            key={`${speaker}-idx-${idx}`}
            justifyContent="space-between"
            gap={1}
            alignItems="center"
          >
            <Text fontSize="14px">{speaker}</Text>
            <IconButton
              fontSize="16px"
              p="6px"
              size="sm"
              minW="auto"
              h="auto"
              variant="ghost"
              onClick={() => handleRemoveItem(idx)}
              aria-label="edit speaker"
              icon={<BiX />}
            />
          </Flex>
        );
      })}
    </>
  );
};

export const SingleSelectField = ({
  name,
  editedData,
  updateData,
  autoCompleteList,
}: Props) => {
  const handleSelect = (e: any) => {
    const value = e.target.value;
    if (!value.trim()) {
      updateData([]);
      return;
    }
    updateData([value]);
  };
  const prevSelectedDataNotInList = () => {
    let newListItems: AutoCompleteData[] = [];
    if (!editedData.length) return newListItems;
    const flattenedListData = autoCompleteList.map((item) => item.value);
    const _newLitsItems = editedData.filter(
      (item) => !flattenedListData.includes(item)
    );
    _newLitsItems.forEach((item) => {
      const slug = slugify(item);
      newListItems.push({ slug, value: item });
    });
    return newListItems;
  };

  const newAutoCompleteList = autoCompleteList.concat(
    prevSelectedDataNotInList()
  );
  return (
    <Select
      placeholder={`Select a ${name}`}
      bgColor="blackAlpha.100"
      rounded="md"
      border="2px solid"
      borderColor="gray.200"
      borderRadius="md"
      icon={<FaSortDown fontSize="14px" transform="translate(0, -2)" />}
      onChange={handleSelect}
      size="sm"
      defaultValue={editedData[0]}
    >
      {newAutoCompleteList.map((item, index) => (
        <option key={`${item.slug}${index}`} value={item.value}>
          {item.value}
        </option>
      ))}
    </Select>
  );
};
