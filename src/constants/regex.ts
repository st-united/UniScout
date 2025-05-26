/* eslint-disable no-useless-escape */
export const PHONE_REGEX_PATTERN =
  /^(0?|84?|\+84?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

export const EMAIL_REGEX_PATTERN =
  /^(([^<>()[\]\\.,;:\s@\"]{1,64}(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PASSWORD_REGEX_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,})(?=.*[0-9])(?=.*[(?=.*[`~!@#%&_=+;:'",<>/\$\^\*\(\)\-\[\]\{\}\\\|\.\?])\S*$/;

export const INTEGER_REGEX = /^[0-9]*$/;

export const DECIMAL_REGEX = /^[0-9,.]*$/;

export const ALLOW_ALPHABET_REGEX_PATTERN =
  /[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý ]$/;

export const NO_SPECIAL_CHARACTER = /^[A-Za-z0-9]+$/;

export const NO_SPACE = /^[A-Za-z0-9][A-Za-z0-9]*$/;

export const NO_SPECIAL_CHARACTER_ALLOW_ROUND_BRACKET = /^[A-Za-z0-9()]+$/;

export const SPECIAL_CHARACTER_ALLOW_DASH_DOT = /^[A-Za-z0-9-.]+$/;

export const SPECIAL_CHARACTER_ALLOW_DOT = /^[A-Za-z0-9.]+$/;

export const SPECIAL_CHARACTERS_ALLOW_SPACE = /^[A-Za-z0-9 ]+$/;

export const NO_ALPHABET_REGEX_PATTERN =
  /^((?![ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý ]).)+$/;

export const NO_ALLOW_SPACE =
  /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý]+( [A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý]+)*$/;

export const NO_NUMBER = /^([^0-9]*)+( ([^0-9]*)+)*$/;

export const NO_SPECIAL_CHARACTER_IN_NAME = /^[a-zA-ZÀ-ỹ\s]*$/;

export const NO_TWO_SPACE = /^(?!.*\s{2}).*$/;

export const NO_SPACE_START_END = /^[^\s]+(\s+[^\s]+)*$/;
