export interface ITransaction {
  type: number;
  id: string;
  sender: string;
  senderPublicKey: string;
  fee: number;
  feeAssetId: null;
  timestamp: number;
  proofs: string[];
  version: number;
  dApp: string;
  payment: [
    {
      amount: number;
      assetId: null | string;
    }
  ];
  call: {
    function: string;
    args: [
      {
        type: string;
        value: string;
      },
      {
        type: string;
        value: number;
      }
    ];
  };
  height: number;
  applicationStatus: string;
  spentComplexity: number;
  stateChanges: {
    data: [];
    transfers: [
      {
        address: string;
        asset: string;
        amount: number;
      }
    ];
    issues: [];
    reissues: [];
    burns: [];
    sponsorFees: [];
    leases: [];
    leaseCancels: [];
    invokes: [
      {
        dApp: string;
        call: {
          function: string;
          args: [
            {
              type: string;
              value: number;
            }
          ];
        };
        payment: [
          {
            assetId: null;
            amount: number;
          }
        ];
        stateChanges: {
          data: [
            {
              key: string;
              type: string;
              value: number;
            },
            {
              key: string;
              type: string;
              value: number;
            }
          ];
          transfers: [
            {
              address: string;
              asset: string;
              amount: number;
            },
            {
              address: string;
              asset: string;
              amount: number;
            }
          ];
          issues: [];
          reissues: [];
          burns: [];
          sponsorFees: [];
          leases: [];
          leaseCancels: [];
          invokes: [
            {
              dApp: string;
              call: {
                function: string;
                args: [
                  {
                    type: string;
                    value: true;
                  },
                  {
                    type: string;
                    value: number;
                  },
                  {
                    type: string;
                    value: string;
                  }
                ];
              };
              payment: [];
              stateChanges: {
                data: [
                  {
                    key: string;
                    type: string;
                    value: string;
                  },
                  {
                    key: string;
                    type: string;
                    value: number;
                  }
                ];
                transfers: [];
                issues: [];
                reissues: [];
                burns: [];
                sponsorFees: [];
                leases: [
                  {
                    id: string;
                    originTransactionId: string;
                    sender: string;
                    recipient: string;
                    amount: number;
                    height: number;
                    status: string;
                    cancelHeight: number;
                    cancelTransactionId: string;
                  }
                ];
                leaseCancels: [
                  {
                    id: string;
                    originTransactionId: string;
                    sender: string;
                    recipient: string;
                    amount: number;
                    height: number;
                    status: string;
                    cancelHeight: number;
                    cancelTransactionId: string;
                  }
                ];
                invokes: [];
              };
            },
            {
              dApp: string;
              call: {
                function: string;
                args: [
                  {
                    type: string;
                    value: false;
                  },
                  {
                    type: string;
                    value: number;
                  },
                  {
                    type: string;
                    value: string;
                  }
                ];
              };
              payment: [];
              stateChanges: {
                data: [];
                transfers: [];
                issues: [];
                reissues: [];
                burns: [];
                sponsorFees: [];
                leases: [];
                leaseCancels: [];
                invokes: [
                  {
                    dApp: string;
                    call: {
                      function: string;
                      args: [
                        {
                          type: string;
                          value: number;
                        }
                      ];
                    };
                    payment: [];
                    stateChanges: {
                      data: [
                        {
                          key: string;
                          type: string;
                          value: number;
                        },
                        {
                          key: string;
                          type: string;
                          value: number;
                        }
                      ];
                      transfers: [
                        {
                          address: string;
                          asset: string;
                          amount: number;
                        }
                      ];
                      issues: [];
                      reissues: [];
                      burns: [];
                      sponsorFees: [];
                      leases: [];
                      leaseCancels: [];
                      invokes: [];
                    };
                  }
                ];
              };
            }
          ];
        };
      },
      {
        dApp: string;
        call: {
          function: string;
          args: [
            {
              type: string;
              value: string;
            },
            {
              type: string;
              value: number;
            }
          ];
        };
        payment: [
          {
            assetId: string;
            amount: number;
          }
        ];
        stateChanges: {
          data: [
            {
              key: string;
              type: string;
              value: number;
            },
            {
              key: string;
              type: string;
              value: number;
            },
            {
              key: string;
              type: string;
              value: number;
            }
          ];
          transfers: [
            {
              address: string;
              asset: string;
              amount: number;
            }
          ];
          issues: [];
          reissues: [];
          burns: [];
          sponsorFees: [];
          leases: [];
          leaseCancels: [];
          invokes: [
            {
              dApp: string;
              call: {
                function: string;
                args: [];
              };
              payment: [
                {
                  assetId: string;
                  amount: number;
                }
              ];
              stateChanges: {
                data: [
                  {
                    key: string;
                    type: string;
                    value: number;
                  },
                  {
                    key: string;
                    type: string;
                    value: number;
                  },
                  {
                    key: string;
                    type: string;
                    value: number;
                  },
                  {
                    key: string;
                    type: string;
                    value: number;
                  }
                ];
                transfers: [];
                issues: [];
                reissues: [];
                burns: [];
                sponsorFees: [];
                leases: [];
                leaseCancels: [];
                invokes: [];
              };
            }
          ];
        };
      },
      {
        dApp: string;
        call: {
          function: string;
          args: [
            {
              type: string;
              value: number;
            }
          ];
        };
        payment: [
          {
            assetId: string;
            amount: number;
          }
        ];
        stateChanges: {
          data: [
            {
              key: string;
              type: string;
              value: number;
            },
            {
              key: string;
              type: string;
              value: number;
            }
          ];
          transfers: [
            {
              address: string;
              asset: null;
              amount: number;
            },
            {
              address: string;
              asset: null;
              amount: number;
            }
          ];
          issues: [];
          reissues: [];
          burns: [];
          sponsorFees: [];
          leases: [];
          leaseCancels: [];
          invokes: [
            {
              dApp: string;
              call: {
                function: string;
                args: [
                  {
                    type: string;
                    value: false;
                  },
                  {
                    type: string;
                    value: number;
                  },
                  {
                    type: string;
                    value: string;
                  }
                ];
              };
              payment: [];
              stateChanges: {
                data: [
                  {
                    key: string;
                    type: string;
                    value: string;
                  },
                  {
                    key: string;
                    type: string;
                    value: number;
                  }
                ];
                transfers: [];
                issues: [];
                reissues: [];
                burns: [];
                sponsorFees: [];
                leases: [
                  {
                    id: string;
                    originTransactionId: string;
                    sender: string;
                    recipient: string;
                    amount: number;
                    height: number;
                    status: string;
                    cancelHeight: number;
                    cancelTransactionId: string;
                  }
                ];
                leaseCancels: [
                  {
                    id: string;
                    originTransactionId: string;
                    sender: string;
                    recipient: string;
                    amount: number;
                    height: number;
                    status: string;
                    cancelHeight: number;
                    cancelTransactionId: string;
                  }
                ];
                invokes: [];
              };
            }
          ];
        };
      }
    ];
  };
}

export interface IEvaluateScript {
  result: {
    type: string;
    value: Record<
      string,
      {
        type: string;
        value: string | number | boolean | [];
      }
    >;
  };
  complexity: number;
  expr: string;
  address: string;
}
