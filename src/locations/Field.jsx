import React from 'react';
import JSONField from '../components/JSONField'
import ReferenceField from '../components/ReferenceField'
import TextField from '../components/TextField'
import experiments from '../data/experiments'
import { useCMA, useSDK } from '@contentful/react-apps-toolkit';

const mappings = {
  "Object": JSONField,
  "Array": ReferenceField,
  "Symbol": TextField
}

const Field = () => {
  const sdk = useSDK();
  const cma = useCMA();

  sdk.window.startAutoResizer()

  const MappedField = mappings[sdk.field.type]
  return MappedField ? <MappedField sdk={sdk} cma={cma} experiments={experiments} /> : null
};

export default Field;
