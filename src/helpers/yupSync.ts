import { AnySchema } from 'yup';

export const yupSync = (schema: AnySchema) => ({
  async validator({ field }: { field: string }, value: unknown) {
    await schema.validateSyncAt(field, { [field]: value });
  },
});
