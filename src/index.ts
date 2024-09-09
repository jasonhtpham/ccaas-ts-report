/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {ReportDataContract} from './reportDataSharing';

export const contracts: typeof Contract[] = [ReportDataContract];
