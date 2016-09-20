import {Schema, type} from 'eisley'

import AuthModel from '../../../src/models/auth'
import UserModel from '../../../src/models/user'
import OrgModel  from '../../../src/models/organization'

/** @test {AuthModel} */
describe('Auth', function() {

  it('should initialize', function(done) {

    var auth = new AuthModel()

    expect(auth.table).to.be.equal('auth')

    done()

  })

})
