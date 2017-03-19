/*
* author:  gvenzl
* created: 19 Mar 2017
*/

package com.oracle;

public class NoJCEUnlimitedStrengthSetupException extends Exception {

	private static final long serialVersionUID = -1278664890453760133L;
	
	public NoJCEUnlimitedStrengthSetupException() {
		super();
	}
	
	public NoJCEUnlimitedStrengthSetupException(String message) {
		super(message);
	}
	
	public NoJCEUnlimitedStrengthSetupException(String message, Throwable cause) {
		super(message, cause);
	}

	public NoJCEUnlimitedStrengthSetupException(Throwable cause) {
		super(cause);
	}
}
