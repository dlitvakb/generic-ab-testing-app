import React, { useState, useEffect } from 'react';
import { Stack, Paragraph } from '@contentful/f36-components'

const EXPERIMENT_ID_FIELD = 'experimentId'
const VARIATIONS_FIELD = 'variations'


const JSONField = ({sdk, cma, experiments}) => {

  const [selectedExperiment, setSelectedExperiment] = useState(experiments.find(e => e.id === sdk.entry.fields[EXPERIMENT_ID_FIELD].getValue()))
  const [variations, setVariations] = useState(selectedExperiment.variations)

  const [variationSelections, setVariationSelections] = useState(sdk.field.getValue() || [])
  const [availableEntryMappings, setAvailableEntryMappings] = useState(sdk.entry.fields[VARIATIONS_FIELD].getValue())

  const setSelections = async (variations, mappings, sdk, setFn) => {
    if (!mappings) { return }
    const value = variations.map((v, i) => {
      return {
        "variant": v.id,
        "entry": (mappings[i] ? mappings[i].sys.id : null)
      }
    })

    setFn(value)
    await sdk.field.setValue(value)
  }

  useEffect(() => {
    sdk.entry.fields[EXPERIMENT_ID_FIELD].onValueChanged(v => {
      setSelectedExperiment(experiments.find(e => e.id === v))
      setVariations(selectedExperiment.variations)
    })

    sdk.entry.fields[VARIATIONS_FIELD].onValueChanged(v => {
      setAvailableEntryMappings(v)
    })

    setSelections(variations, availableEntryMappings, sdk, setVariationSelections)
  }, [availableEntryMappings, sdk, variations, experiments, selectedExperiment])

  return (
    <Stack flexDirection="column" alignItems="start">
      {variations.map((v) => {
        const variationSelection = variationSelections.find(vs => v.id === vs.variant)
        return (
          <React.Fragment key={v.id}>
            <Paragraph>
            Variation: <b>{v.id}</b> <i>({v.rate}% users)</i>
            <br />
            Entry: <b>{variationSelection?.entry ? `'${variationSelection.entry}'` : "Not yet defined"}</b>
            </Paragraph>
          </React.Fragment>
        )
      })}
    </Stack>
  )
}

export default JSONField;
