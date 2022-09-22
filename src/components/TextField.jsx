import React, { useState } from 'react';
import { Autocomplete, Stack, Paragraph } from '@contentful/f36-components'

const TextField = ({sdk, cma, experiments}) => {
  const experimentIds = experiments.map(e => e.id)

  const [selectedExperiment, setSelectedExperiment] = useState(sdk.field.getValue())
  const [availableExperiments, setAvailableExperiments] = useState(experimentIds)

  const handleInputValueChange = (value) => {
    const newFilteredItems = experimentIds.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase()),
    );
    setAvailableExperiments(newFilteredItems);
  };

  const handleSelectItem = (item) => {
    setSelectedExperiment(item);
    sdk.field.setValue(item)
  };

  return (
    <Stack flexDirection="column" alignItems="start">
      <Autocomplete
        items={availableExperiments}
        selectedItem={selectedExperiment}
        onInputValueChange={handleInputValueChange}
        onSelectItem={handleSelectItem}
      />

      <Paragraph>
        Selected experiment: <b>{selectedExperiment}</b>
      </Paragraph>
    </Stack>
  )
}

export default TextField
