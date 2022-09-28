import React, { useState, useEffect } from 'react';
import { Stack, EntityList, Menu, MenuItem, MenuDivider, Button, Paragraph } from '@contentful/f36-components'
import { PlusIcon, ChevronDownIcon } from '@contentful/f36-icons';

const VARIATION_CONTAINER_CONTENT_TYPE_ID = "variationContainer"
const EXPERIMENT_ID_FIELD = 'experimentId'

const ReferenceField = ({sdk, cma, experiments}) => {
  const [value, setValue] = useState(sdk.field.getValue() || [])
  const [entries, setEntries] = useState([])

  const [selectedExperiment, setSelectedExperiment] = useState(experiments.find(e => e.id === sdk.entry.fields[EXPERIMENT_ID_FIELD].getValue()))
  const [variations, setVariations] = useState(selectedExperiment.variations)


  const contentTypes = sdk.space.getCachedContentTypes()
  const [availableContentTypes, setAvailableContentTypes] = useState([])

  const contentTypeFor = (entry) => {
    return contentTypes.find(ct => ct.sys.id === entry.sys.contentType.sys.id)
  }

  const statusFor = (entry) => {
    if (entry.sys.archivedAt) return "archived"
    if (entry.sys.publishedAt && entry.sys.updatedAt && entry.sys.publishedAt <= entry.sys.updatedAt) return "changed"
    if (entry.sys.publishedAt) return "published"

    return "draft"
  }

  const entryAsLink = (entry) => {
    return {
      sys: {
        id: entry.sys.id,
        type: "Link",
        linkType: "Entry"
      }
    }
  }

  const displayTitle = (entry) => {
    const contentType = contentTypeFor(entry)
    const displayFieldId = contentType.displayField
    return entry.fields[displayFieldId] ? entry.fields[displayFieldId][sdk.locales.default] : "Untitled"
  }

  const onClickEntry = (entry) => {
    sdk.navigator.openEntry(entry.sys.id, { slideIn: { waitForClose: true } })
  }

  const onRemoveEntry = (index) => {
    let newValue = [...value]
    newValue.splice(index, 1)
    setValue(newValue)
    fetchEntries().then(() => sdk.field.setValue(newValue))
  }

  const onAddExistingEntry = async () => {
    const addedEntry = await sdk.dialogs.selectSingleEntry({contentTypes: availableContentTypes})
    if (addedEntry) {
      const newValue = [...value, entryAsLink(addedEntry)]
      setValue(newValue)
      fetchEntries().then(() => sdk.field.setValue(newValue))
    }
  }

  const onAddNewEntry = (contentType) => {
    sdk.navigator.openNewEntry(contentType, { slideIn: true }).then(({newEntry}) => {
      if (newEntry) {
        const newValue = [...value, entryAsLink(newEntry)]
        setValue(newValue)
        fetchEntries().then(() => sdk.field.setValue(newValue))
      }
    })
  }

  const onMoveUp = (index) => {
    let newValue = [...value];
    [newValue[index], newValue[index - 1]] = [newValue[index - 1], newValue[index]]

    setValue(newValue)
    fetchEntries().then(() => sdk.field.setValue(newValue))
  }

  const onMoveDown = (index) => {
    let newValue = [...value];
    [newValue[index + 1], newValue[index]] = [newValue[index], newValue[index + 1]]

    setValue(newValue)
    fetchEntries().then(() => sdk.field.setValue(newValue))
  }

  const onMoveTop = (entry) => {
    let newValue = value.filter(e => e.sys.id !== entry.sys.id)
    newValue = [entryAsLink(entry), ...newValue]
    setValue(newValue)
    fetchEntries().then(() => sdk.field.setValue(newValue))
  }

  const onMoveBottom = (entry) => {
    let newValue = value.filter(e => e.sys.id !== entry.sys.id)
    newValue = [...newValue, entryAsLink(entry)]
    setValue(newValue)
    fetchEntries().then(() => sdk.field.setValue(newValue))
  }

  const fetchEntries = async () => {
    const entryIds = value.map(v => v.sys.id)
    const rawEntries = await sdk.space.getEntries({"sys.id[in]": entryIds})

    setEntries(rawEntries.items)
  }
  const fetchParentEntry = async () => {
    const parents = (await sdk.space.getEntries({"links_to_entry": sdk.entry.getSys().id})).items

    let parent = null
    if (parents.length >= 0) {
      parent = parents[0]
    } else {
      return
    }

    const parentContentType = contentTypes.find(ct => ct.sys.id === parent.sys.contentType.sys.id)
    let parentAvailableRelations = []
    parentContentType.fields.forEach(f => {
      if (f.type === "Array" && f.items.type === "Link" && f.items.linkType === "Entry") {
        if (f.items.validations && f.items.validations) {
          f.items.validations.forEach(val => {
            if (val.linkContentType && val.linkContentType.includes(VARIATION_CONTAINER_CONTENT_TYPE_ID)) {
              const arrayFieldCTs = val.linkContentType.filter(v => v !== VARIATION_CONTAINER_CONTENT_TYPE_ID)
              parentAvailableRelations = [...parentAvailableRelations, ...arrayFieldCTs]
            }
          })
        }
      }
      if (f.type === "Link" && f.linkType === "Entry") {
        if (f.validations && f.validations) {
          f.validations.forEach(val => {
            if (val.linkContentType && val.linkContentType.includes(VARIATION_CONTAINER_CONTENT_TYPE_ID)) {
              const fieldCTs = f.items.validations.linkContentType.filter(v => v !== VARIATION_CONTAINER_CONTENT_TYPE_ID)
              parentAvailableRelations = [...parentAvailableRelations, ...fieldCTs]
            }
          })
        }
      }
    })

    setAvailableContentTypes(parentAvailableRelations)
  }

  useEffect(() => {
    sdk.entry.fields[EXPERIMENT_ID_FIELD].onValueChanged(v => {
      setSelectedExperiment(experiments.find(e => e.id === v))
      setVariations(selectedExperiment.variations)
    })

    fetchParentEntry()
    fetchEntries()
  }, [value, selectedExperiment, variations])

  return (
    <Stack flexDirection="column" alignItems="start">
      <EntityList>
      {value.map((v, i) => {
        if (entries.length === 0) {
          return <EntityList.Item isLoading />
        }
        const entry = entries.find(e => v.sys.id === e.sys.id)
        if (!entry) {
          return <EntityList.Item isLoading />
        }

        return (
          <EntityList.Item
            key={`${entry.sys.id}-${i}`}
            title={displayTitle(entry)}
            contentType={contentTypeFor(entry).name}
            description={`Mapped Variation: ${variations[i] ? variations[i].id : "No variation"}`}
            status={statusFor(entry)}
            actions={[
              <MenuItem onClick={() => onClickEntry(entry)}>Edit</MenuItem>,
              <MenuItem onClick={() => onRemoveEntry(entry)}>Remove</MenuItem>,
              <MenuDivider />,
              <MenuItem disabled={i === 0} onClick={() => onMoveUp(i)}>Move Up</MenuItem>,
              <MenuItem disabled={i === entries.length - 1} onClick={() => onMoveDown(i)}>Move Down</MenuItem>,
              <MenuItem disabled={i === 0} onClick={() => onMoveTop(entry)}>Move to Top</MenuItem>,
              <MenuItem disabled={i === entries.length - 1} onClick={() => onMoveBottom(entry)}>Move to Bottom</MenuItem>,
            ]}
          />
        )
      })}
      </EntityList>
      <Stack spacing="spacingXs">
        {availableContentTypes.length >= 0 ?
        <>
          <Button isDisabled={value.length >= variations.length} startIcon={<PlusIcon />} onClick={onAddExistingEntry}>Add Existing</Button>
          <Menu>
            <Menu.Trigger>
              <Button isDisabled={value.length >= variations.length} endIcon={<ChevronDownIcon />}>Add new</Button>
            </Menu.Trigger>
            <Menu.List>
              {availableContentTypes.map(ct => {
                return (
                  <Menu.Item key={ct} onClick={() => onAddNewEntry(ct)}>{contentTypes.find(c => c.sys.id === ct).name}</Menu.Item>
                )
              })}
            </Menu.List>
          </Menu>
        </>
        : <Paragraph>Container is unlinked or parent has no other reference types available, must have a parent entry with references accepting more than a Variation Container.</Paragraph>}
      </Stack>
    </Stack>
  )
}

export default ReferenceField;
