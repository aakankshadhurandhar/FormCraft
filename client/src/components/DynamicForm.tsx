import React from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { zodResolver } from '@hookform/resolvers/zod';
import { Control, FieldValues, useForm } from 'react-hook-form';
import * as z from 'zod';

type Option = {
  label: string;
  value: string;
};

type Input = {
  min?: number | string;
  max?: number | string;
  label: string;
  required: boolean;
  description?: string;
  type: string;
  options?: Option[];
};

type FormSchema = {
  owner: string;
  sharedWith: string[];
  title: string;
  description: string;
  published: boolean;
  inputs: Input[];
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const createFormData = (values: { [key: string]: string }) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (typeof value === 'object' && value !== null) {
      const subValues = Object.keys(value);
      subValues.forEach((subValue) => {
        formData.append(key, subValue);
      });
    } else {
      formData.append(key, value);
    }
  }
  return formData;
};

const createZodValidationSchema = (formSchema: any) => {
  const schema: { [key: string]: any } = {};

  formSchema.inputs.forEach((input: any) => {
    let validator;

    switch (input.type) {
      case 'small':
      case 'long':
      case 'email':
        validator = z.string();
        if (input.min && input.max) {
          validator = validator
            .min(input.min, `Must be at least ${input.min} characters`)
            .max(input.max, `Must be at most ${input.max} characters`);
        }
        if (input.type === 'email') {
          validator = validator.email('Must be a valid email address');
        }
        break;

      case 'date':
        //date
        validator = z
          .string()
          .refine(
            (val) => {
              return /^\d{4}-\d{2}-\d{2}$/.test(val);
            },
            { message: 'Must be a valid date' },
          )
          .refine(
            (val) => {
              if (input.min) {
                const minDate = new Date(input.min);
                const date = new Date(val);
                return date >= minDate;
              }
              return true;
            },
            { message: `Must be after ${input.min}` },
          )
          .refine(
            (val) => {
              if (input.max) {
                const maxDate = new Date(input.max);
                const date = new Date(val);
                return date <= maxDate;
              }
              return true;
            },
            { message: `Must be before ${input.max}` },
          );

        break;

      case 'time':
        validator = z
          .string()
          .regex(
            /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            'Must be a valid time format HH:mm',
          )
          .refine(
            (val) => {
              const [hours, minutes] = val.split(':');
              const [minHours, minMinutes] = input.min.split(':');
              const totalMinutes = Number(hours) * 60 + Number(minutes);
              const minTotalMinutes =
                Number(minHours) * 60 + Number(minMinutes);
              return totalMinutes >= minTotalMinutes;
            },
            {
              message: `Must be atleast ${input.min} `,
            },
          )
          .refine(
            (val) => {
              const [hours, minutes] = val.split(':');
              const [maxHours, maxMinutes] = input.max.split(':');
              const totalMinutes = Number(hours) * 60 + Number(minutes);
              const maxTotalMinutes =
                Number(maxHours) * 60 + Number(maxMinutes);
              return totalMinutes <= maxTotalMinutes;
            },
            {
              message: `Must be atmost ${input.max} `,
            },
          );

        break;

      case 'multi':
        validator = z
          .array(z.string())
          .refine((value) => value.some((item) => item), {
            message: 'You have to select at least one option.',
          });
        break;

      case 'number':
        validator = z
          .string()
          .refine((val) => !isNaN(Number(val)), {
            message: 'Must be a number',
          })
          .transform((val) => Number(val))
          .refine((val) => val >= input.min, {
            message: `Must be at least ${input.min}`,
          })
          .refine((val) => val <= input.max, {
            message: `Must be at most ${input.max}`,
          });

        break;

      case 'none':
        return;

      default:
        validator = z.string();
    }

    if (input.required) {
      // validator = validator.nonempty('Required');
    }

    schema[input.label] = validator;
  });

  return z.object(schema);
};

const CustomFormField = ({ control, input } : { control:  Control<FieldValues>, input: Input }) => {
  if (input.type === 'multi') {
    return (
      <FormField
        control={control}
        name={input.label}
        render={() => (
          <FormItem>
            <FormLabel>{input.label}</FormLabel>
            <FormDescription>{input.description}</FormDescription>
            {input.options?.map((option) => (
              <FormField
                key={option.value}
                control={control}
                name={input.label}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                    <Checkbox
                        checked={field.value?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          console.log(checked,field);
                          return checked
                            ? field.onChange([...field.value, option.value])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== option.value,
                                ),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                  
                )}
              />
            ))}
            
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={control}
      key={input.label}
      name={input.label}
      render={({ field }) => {
        let inputComponent;
        switch (input.type) {
          case 'none':
            inputComponent = null;
            break;
          case 'number':
            inputComponent = <Input {...field} type="number" />;
            break;
          case 'long':
            inputComponent = <Textarea {...field} />;
            break;
          case 'email':
            inputComponent = <Input {...field} type="email" />;
            break;
          case 'date':
            inputComponent = <Input {...field} type="date" />;
            break;
          case 'time':
            inputComponent = <Input {...field} type="time" />;
            break;
          // case 'multi':

          case 'radio':
            inputComponent = (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormDescription>{input.description}</FormDescription>
                {input?.options?.map((option: Option) => (
                  <FormItem
                    className="flex items-center space-x-3 space-y-0"
                    key={option.value}
                  >
                    <FormControl>
                      <RadioGroupItem value={option.value} />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            );
            break;

          default:
            inputComponent = <Input {...field} />;
        }
        return (
          
            <FormItem>
            <FormLabel>{input.label}</FormLabel>
            <FormDescription>{input.description}</FormDescription>
            <FormControl>{inputComponent}</FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const DynamicForm = ({ formSchema } : { formSchema: FormSchema}) => {
  const validationSchema = createZodValidationSchema(formSchema);
  const defaultValues: { [key: string]: any } = {};

  formSchema.inputs.forEach((input: any) => {
    if (input.type === 'multi') {
      defaultValues[input.label] = [];
    }
  });
  const form = useForm({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    defaultValues
  });
  const onSubmit = async (data: any) => {
    console.log('Data', data);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="container mx-auto px-4 py-8 w-1/2  bg-teal-100">
        <h1 className="text-2xl font-bold">{formSchema.title}</h1>
        <p className="text-gray-600">{formSchema.description}</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formSchema.inputs.map((input: any) => (
              <CustomFormField
                key={input.label}
                control={form.control}
                input={input}
              />
            ))}

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default DynamicForm;
