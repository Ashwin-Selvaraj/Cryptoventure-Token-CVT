// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract CryptoVentureMultisig is ReentrancyGuard {
    event TokenDeposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    // Immutable variables for gas optimization
    address public immutable token;
    uint256 public immutable numConfirmationsRequired;
    uint256 private constant DECIMALS = 18;

    // Storage variables
    address[] private _owners;
    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    // mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    Transaction[] private _transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < _transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!_transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    modifier validAmount(uint256 _amount) {
        require(_amount > 0, "amount must be greater than 0");
        require(_amount <= IERC20(token).balanceOf(address(this)), "insufficient balance");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "invalid address");
        _;
    }

    constructor(
        address[] memory owners_, 
        uint256 _numConfirmationsRequired,
        address _token
    ) payable {
        require(owners_.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= owners_.length,
            "invalid number of required confirmations"
        );
        require(_token != address(0), "invalid token address");
        require(IERC20(_token).decimals() == DECIMALS, "invalid token decimals");

        _owners = new address[](owners_.length);
        for (uint256 i = 0; i < owners_.length; i++) {
            address owner = owners_[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            _owners[i] = owner;
        }

        numConfirmationsRequired = _numConfirmationsRequired;
        token = _token;
    }

    function depositTokens(uint256 _amount) 
        external 
        nonReentrant 
        validAmount(_amount) 
    {
        address self = address(this);
        require(
            IERC20(token).transferFrom(msg.sender, self, _amount),
            "transfer failed"
        );
        emit TokenDeposit(msg.sender, _amount, IERC20(token).balanceOf(self));
    }

    function submitTransaction(
        address _to, 
        uint256 _value, 
        bytes memory _data
    ) 
        public 
        onlyOwner 
        nonReentrant 
        validAmount(_value)
        validAddress(_to)
    {
        uint256 txIndex = _transactions.length;
        Transaction memory newTx = Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        });
        _transactions.push(newTx);

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        nonReentrant
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = _transactions[_txIndex];
        transaction.numConfirmations++;
        isConfirmed[_txIndex][msg.sender] = true;
        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        nonReentrant
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = _transactions[_txIndex];
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );

        transaction.executed = true;

        if (transaction.value != 0) {
            require(
                IERC20(token).transfer(transaction.to, transaction.value),
                "token transfer failed"
            );
        }

        if (transaction.data.length != 0) {
            (bool success,) = transaction.to.call(transaction.data);
            require(success, "tx failed");
        }

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        nonReentrant
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = _transactions[_txIndex];
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        transaction.numConfirmations--;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // View functions
    function getOwners() public view returns (address[] memory) {
        return _owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return _transactions.length;
    }

    function getTransaction(uint256 _txIndex)
        public
        view
        returns (Transaction memory)
    {
        return _transactions[_txIndex];
    }

    function getTokenBalance() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
