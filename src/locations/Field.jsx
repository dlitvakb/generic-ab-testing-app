import React from 'react';
import JSONField from '../components/JSONField'
import TextField from '../components/TextField'
import experiments from '../data/experiments'
import { useCMA, useSDK } from '@contentful/react-apps-toolkit';

const mappings = {
  "Object": JSONField,
  "Symbol": TextField
}

const Field = () => {
  const sdk = useSDK();
  const cma = useCMA();

  const MappedField = mappings[sdk.field.type]
  return MappedField ? <MappedField sdk={sdk} cma={cma} experiments={experiments} /> : null
};

export default Field;
