/**
 * useForm Hook
 * 提供表单状态管理、验证和提交功能
 */

import { useState, useCallback, useRef, useEffect, ChangeEvent, FormEvent } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidate?: (values: T) => Partial<Record<keyof T, string>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface UseFormReturn<T> extends FormState<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setTouchedFields: (fields: Partial<Record<keyof T, boolean>>) => void;
  handleChange: (field: keyof T) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (event?: FormEvent) => Promise<void>;
  reset: () => void;
  resetField: (field: keyof T) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => string | null;
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean | undefined;
  };
}

/**
 * 表单Hook
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationRules = {},
    onSubmit,
    onValidate,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValuesRef = useRef(initialValues);

  // 计算表单是否有效
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // 计算表单是否被修改
  const isDirty = useCallback(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  }, [values]);

  // 验证单个字段
  const validateField = useCallback((field: keyof T): string | null => {
    const value = values[field];
    const rule = validationRules[field as string];

    if (!rule) return null;

    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || `${String(field)} 是必填项`;
    }

    // 最小长度验证
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${String(field)} 最少需要 ${rule.minLength} 个字符`;
    }

    // 最大长度验证
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${String(field)} 最多只能有 ${rule.maxLength} 个字符`;
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${String(field)} 格式不正确`;
    }

    // 自定义验证
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [values, validationRules]);

  // 验证所有字段
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    // 验证所有有规则的字段
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    });

    // 如果有自定义验证函数，也执行它
    if (onValidate) {
      const customErrors = onValidate(values);
      Object.assign(newErrors, customErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules, onValidate, validateField]);

  // 设置单个字段值
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues((prev: T) => ({ ...prev, [field]: value }));

    // 如果启用了实时验证，则验证该字段
    if (validateOnChange) {
      const error = validateField(field);
      setErrors((prev: Partial<Record<keyof T, string>>) => ({
        ...prev,
        [field]: error || undefined
      }));
    }
  }, [validateOnChange, validateField]);

  // 设置多个字段值
  const setValuesCallback = useCallback((newValues: Partial<T>) => {
    setValues((prev: T) => ({ ...prev, ...newValues }));
  }, []);

  // 设置单个字段错误
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev: Partial<Record<keyof T, string>>) => ({ ...prev, [field]: error }));
  }, []);

  // 设置多个字段错误
  const setErrorsCallback = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors((prev: Partial<Record<keyof T, string>>) => ({ ...prev, ...newErrors }));
  }, []);

  // 设置单个字段的触摸状态
  const setTouchedCallback = useCallback((field: keyof T, touched: boolean) => {
    setTouched((prev: Partial<Record<keyof T, boolean>>) => ({ ...prev, [field]: touched }));
  }, []);

  // 设置多个字段的触摸状态
  const setTouchedFields = useCallback((fields: Partial<Record<keyof T, boolean>>) => {
    setTouched((prev: Partial<Record<keyof T, boolean>>) => ({ ...prev, ...fields }));
  }, []);

  // 处理字段变化
  const handleChange = useCallback((field: keyof T) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
      setValue(field, value);
    };
  }, [setValue]);

  // 处理字段失焦
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouchedCallback(field, true);
      
      // 如果启用了失焦验证，则验证该字段
      if (validateOnBlur) {
        const error = validateField(field);
        setErrors((prev: Partial<Record<keyof T, string>>) => ({
          ...prev,
          [field]: error || undefined
        }));
      }
    };
  }, [validateOnBlur, validateField, setTouched, setErrors]);

  // 处理表单提交
  const handleSubmit = useCallback(async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    // 如果启用了提交验证，先验证表单
    if (validateOnSubmit && !validate()) {
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateOnSubmit, validate, onSubmit, values]);

  // 重置表单
  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // 重置单个字段
  const resetField = useCallback((field: keyof T) => {
    setValues((prev: T) => ({ ...prev, [field]: initialValuesRef.current[field] }));
    setErrors((prev: Partial<Record<keyof T, string>>) => ({ ...prev, [field]: undefined }));
    setTouched((prev: Partial<Record<keyof T, boolean>>) => ({ ...prev, [field]: false }));
  }, []);

  // 获取字段属性
  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
      error: errors[field],
      touched: touched[field]
    };
  }, [values, errors, touched, handleChange, handleBlur]);

  // 当初始值改变时更新引用
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid: isValid(),
    isDirty: isDirty(),
    isSubmitting,
    setValue,
    setValues: setValuesCallback,
    setError,
    setErrors: setErrorsCallback,
    setTouched: setTouchedCallback,
    setTouchedFields,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
    validate,
    validateField,
    getFieldProps
  };
}

/**
 * 用于受控输入框的Hook
 */
export function useInput<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  field: keyof T
) {
  const fieldProps = form.getFieldProps(field);
  
  return {
    ...fieldProps,
    hasError: !!fieldProps.error && fieldProps.touched,
    isRequired: false, // 可以从validationRules中获取
    isDisabled: form.isSubmitting
  };
}

/**
 * 用于表单数组的Hook
 */
export function useFieldArray<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  field: keyof T
) {
  const values = form.values[field] as any[];
  
  const add = useCallback((item: any) => {
    const newValues = [...(values || []), item];
    form.setValue(field, newValues);
  }, [form, field, values]);

  const remove = useCallback((index: number) => {
    const newValues = values?.filter((_, i) => i !== index) || [];
    form.setValue(field, newValues);
  }, [form, field, values]);

  const update = useCallback((index: number, item: any) => {
    if (!values) return;
    const newValues = [...values];
    newValues[index] = item;
    form.setValue(field, newValues);
  }, [form, field, values]);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    if (!values) return;
    const newValues = [...values];
    const [removed] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, removed);
    form.setValue(field, newValues);
  }, [form, field, values]);

  return {
    values: values || [],
    add,
    remove,
    update,
    move,
    length: values?.length || 0
  };
}

export default useForm;
