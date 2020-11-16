module.exports.bigqueryConfig = {
  datasetID: process.env.BQ_DATASET_ID,
  projectID: process.env.BQ_PROJECT_ID,
  private_key: decodeURI(process.env.BQ_PRIVATE_KEY),
  clientId: process.env.BQ_CLIENT_ID,
  client_email: process.env.BQ_CLIENT_EMAIL,
};

module.exports.fop = {
  tableID: 'fop_s',
  record: [],
  repeated: ['activity_kinds', 'exchange_data'],
  settlementsSchema: [
    {
      name: 'record',
      type: 'INT64',
      mode: 'NULLABLE',
    },
    {
      name: 'name',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'address',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'stan',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'activity_kinds',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'primary',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'registration',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'estate_manager',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'terminated_info',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'termination_cancel_info',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'exchange_data',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'authority_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'authority_code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'tax_payer_type',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'start_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'start_num',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'end_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'end_num',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'contacts',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'vp_dates',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'current_authority',
      type: 'STRING',
      mode: 'NULLABLE',
    },
  ],
};

module.exports.uo = {
  tableID: 'uo_s',
  record: ['executive_power', 'bankruptcy_readjustment_info', 'termination_started_info'],
  repeated: ['activity_kinds', 'exchange_data', 'branches', 'predecessors', 'assignees', 'signers', 'founders'],
  settlementsSchema: [
    {
      name: 'record',
      type: 'INT64',
      mode: 'NULLABLE',
    },
    {
      name: 'name',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'short_name',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'opf',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'edrpou',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'address',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'registration',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'managing_paper',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'stan',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'founding_document_num',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'executive_power',
      type: 'STRUCT',
      fields: [
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'founders',
      type: 'STRING',
      mode: 'REPEATED',
    },
    {
      name: 'activity_kinds',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'primary',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'superior_management',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'signers',
      type: 'STRING',
      mode: 'REPEATED',
    },
    {
      name: 'authorized_capital',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'statute',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'branches',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'address',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'activity_kinds',
          type: 'STRUCT',
          mode: 'REPEATED',
          fields: [
            {
              name: 'code',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'name',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'primary',
              type: 'STRING',
              mode: 'NULLABLE',
            },
          ],
        },
        {
          name: 'signer',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'create_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'exchange_data',
          type: 'STRUCT',
          mode: 'REPEATED',
          fields: [
            {
              name: 'authority_name',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'authority_code',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'tax_payer_type',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'start_date',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'start_num',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'end_date',
              type: 'STRING',
              mode: 'NULLABLE',
            },
            {
              name: 'end_num',
              type: 'STRING',
              mode: 'NULLABLE',
            },
          ],
        },
        {
          name: 'contacts',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'termination_started_info',
      type: 'STRUCT',
      fields: [
        {
          name: 'op_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'reason',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'sbj_state',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'signer_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'creditor_req_end_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'bankruptcy_readjustment_info',
      type: 'STRUCT',
      fields: [
        {
          name: 'op_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'reason',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'sbj_state',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'bankruptcy_readjustment_head_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'predecessors',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'assignees',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'terminated_info',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'termination_cancel_info',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'contacts',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'exchange_data',
      type: 'STRUCT',
      mode: 'REPEATED',
      fields: [
        {
          name: 'authority_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'authority_code',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'tax_payer_type',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'start_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'start_num',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'end_date',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'end_num',
          type: 'STRING',
          mode: 'NULLABLE',
        },
      ],
    },
    {
      name: 'vp_dates',
      type: 'STRING',
      mode: 'NULLABLE',
    },
    {
      name: 'current_authority',
      type: 'STRING',
      mode: 'NULLABLE',
    },
  ],
};
