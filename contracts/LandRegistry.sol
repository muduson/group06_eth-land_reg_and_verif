// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LandRegistry is Ownable, ReentrancyGuard {
    uint256 private _landIds;
    uint256 private _transferIds;

    struct Land {
        uint256 id;
        string landId;
        string description;
        string location;
        uint256 area;
        string imageUrl;
        address currentOwner;
        bool isRegistered;
        uint256 registrationDate;
    }

    struct TransferRequest {
        uint256 id;
        uint256 landId;
        address from;
        address to;
        uint256 price;
        bool isApproved;
        bool isCompleted;
        uint256 requestDate;
        string message;
    }

    struct User {
        address userAddress;
        string name;
        string email;
        bool isRegistered;
        bool isAdmin;
        bool isActive;
        uint256 registrationDate;
    }

    mapping(uint256 => Land) public lands;
    mapping(address => User) public users;
    mapping(uint256 => TransferRequest) public transferRequests;
    mapping(address => uint256[]) public userLands;
    mapping(uint256 => uint256[]) public landTransferHistory;

    uint256[] public allLandIds;
    uint256[] public allTransferRequestIds;

    event LandRegistered(
        uint256 indexed landId,
        string landIdString,
        address indexed owner,
        string description,
        string location,
        uint256 area,
        string imageUrl
    );

    event UserRegistered(
        address indexed userAddress,
        string name,
        string email,
        bool isAdmin
    );

    event TransferRequested(
        uint256 indexed requestId,
        uint256 indexed landId,
        address indexed from,
        address to,
        uint256 price
    );

    event TransferApproved(
        uint256 indexed requestId,
        uint256 indexed landId,
        address indexed from,
        address to
    );

    event TransferCompleted(
        uint256 indexed landId,
        address indexed from,
        address indexed to
    );

    event UserRevoked(
        address indexed userAddress
    );

    event UserReinstated(
        address indexed userAddress
    );

    event LandDeleted(
        uint256 indexed landId,
        address indexed owner
    );

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        require(users[msg.sender].isActive, "User is not active");
        _;
    }

    modifier onlyAdmin() {
        require(users[msg.sender].isAdmin, "Not an admin");
        _;
    }

    modifier onlyLandOwner(uint256 _landId) {
        require(lands[_landId].currentOwner == msg.sender, "Not land owner");
        _;
    }

    constructor() Ownable(msg.sender) {
        // Register the contract deployer as the first admin
        _registerUser(msg.sender, "System Admin", "admin@landregistry.com", true);
    }

    function registerUser(
        address _userAddress,
        string memory _name,
        string memory _email,
        bool _isAdmin
    ) external onlyAdmin {
        _registerUser(_userAddress, _name, _email, _isAdmin);
    }

    function _registerUser(
        address _userAddress,
        string memory _name,
        string memory _email,
        bool _isAdmin
    ) internal {
        require(!users[_userAddress].isRegistered, "User already registered");
        require(_userAddress != address(0), "Invalid address");

        users[_userAddress] = User({
            userAddress: _userAddress,
            name: _name,
            email: _email,
            isRegistered: true,
            isAdmin: _isAdmin,
            isActive: true,
            registrationDate: block.timestamp
        });

        emit UserRegistered(_userAddress, _name, _email, _isAdmin);
    }

    function registerLand(
        string memory _landId,
        string memory _description,
        string memory _location,
        uint256 _area,
        string memory _imageUrl,
        address _owner
    ) external onlyAdmin {
        require(_owner != address(0), "Invalid owner address");
        require(users[_owner].isRegistered, "Owner not registered");
        require(bytes(_landId).length > 0, "Land ID required");

        _landIds++;
        uint256 newLandId = _landIds;

        lands[newLandId] = Land({
            id: newLandId,
            landId: _landId,
            description: _description,
            location: _location,
            area: _area,
            imageUrl: _imageUrl,
            currentOwner: _owner,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        userLands[_owner].push(newLandId);
        allLandIds.push(newLandId);

        emit LandRegistered(newLandId, _landId, _owner, _description, _location, _area, _imageUrl);
    }

    function requestTransfer(
        uint256 _landId,
        address _to,
        uint256 _price,
        string memory _message
    ) external onlyRegisteredUser onlyLandOwner(_landId) {
        require(_to != address(0), "Invalid recipient address");
        require(users[_to].isRegistered, "Recipient not registered");
        require(_to != msg.sender, "Cannot transfer to yourself");

        _transferIds++;
        uint256 newRequestId = _transferIds;

        transferRequests[newRequestId] = TransferRequest({
            id: newRequestId,
            landId: _landId,
            from: msg.sender,
            to: _to,
            price: _price,
            isApproved: false,
            isCompleted: false,
            requestDate: block.timestamp,
            message: _message
        });

        allTransferRequestIds.push(newRequestId);

        emit TransferRequested(newRequestId, _landId, msg.sender, _to, _price);
    }

    function approveTransfer(uint256 _requestId) external onlyAdmin {
        require(transferRequests[_requestId].id != 0, "Request not found");
        require(!transferRequests[_requestId].isApproved, "Already approved");
        require(!transferRequests[_requestId].isCompleted, "Already completed");

        TransferRequest storage request = transferRequests[_requestId];
        request.isApproved = true;

        emit TransferApproved(_requestId, request.landId, request.from, request.to);
    }

    function completeTransfer(uint256 _requestId) external onlyAdmin nonReentrant {
        require(transferRequests[_requestId].id != 0, "Request not found");
        require(transferRequests[_requestId].isApproved, "Transfer not approved");
        require(!transferRequests[_requestId].isCompleted, "Already completed");

        TransferRequest storage request = transferRequests[_requestId];
        Land storage land = lands[request.landId];

        address previousOwner = land.currentOwner;
        address newOwner = request.to;

        // Remove land from previous owner's list
        _removeLandFromUser(previousOwner, request.landId);
        
        // Add land to new owner's list
        userLands[newOwner].push(request.landId);
        
        // Update land ownership
        land.currentOwner = newOwner;
        
        // Mark transfer as completed
        request.isCompleted = true;
        
        // Add to transfer history
        landTransferHistory[request.landId].push(_requestId);

        emit TransferCompleted(request.landId, previousOwner, newOwner);
    }

    function _removeLandFromUser(address _user, uint256 _landId) internal {
        uint256[] storage userLandsList = userLands[_user];
        for (uint256 i = 0; i < userLandsList.length; i++) {
            if (userLandsList[i] == _landId) {
                userLandsList[i] = userLandsList[userLandsList.length - 1];
                userLandsList.pop();
                break;
            }
        }
    }

    // View functions
    function getLand(uint256 _landId) external view returns (Land memory) {
        require(lands[_landId].isRegistered, "Land not found");
        return lands[_landId];
    }

    function getUser(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].isRegistered, "User not found");
        return users[_userAddress];
    }

    function getUserLands(address _user) external view returns (uint256[] memory) {
        return userLands[_user];
    }

    function getAllLands() external view returns (Land[] memory) {
        Land[] memory allLands = new Land[](allLandIds.length);
        for (uint256 i = 0; i < allLandIds.length; i++) {
            allLands[i] = lands[allLandIds[i]];
        }
        return allLands;
    }

    function getAllTransferRequests() external view returns (TransferRequest[] memory) {
        TransferRequest[] memory allRequests = new TransferRequest[](allTransferRequestIds.length);
        for (uint256 i = 0; i < allTransferRequestIds.length; i++) {
            allRequests[i] = transferRequests[allTransferRequestIds[i]];
        }
        return allRequests;
    }

    function getPendingTransfers() external view returns (TransferRequest[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < allTransferRequestIds.length; i++) {
            if (!transferRequests[allTransferRequestIds[i]].isApproved && 
                !transferRequests[allTransferRequestIds[i]].isCompleted) {
                pendingCount++;
            }
        }

        TransferRequest[] memory pendingRequests = new TransferRequest[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allTransferRequestIds.length; i++) {
            TransferRequest memory request = transferRequests[allTransferRequestIds[i]];
            if (!request.isApproved && !request.isCompleted) {
                pendingRequests[index] = request;
                index++;
            }
        }
        return pendingRequests;
    }

    function getLandTransferHistory(uint256 _landId) external view returns (TransferRequest[] memory) {
        uint256[] memory requestIds = landTransferHistory[_landId];
        TransferRequest[] memory history = new TransferRequest[](requestIds.length);
        for (uint256 i = 0; i < requestIds.length; i++) {
            history[i] = transferRequests[requestIds[i]];
        }
        return history;
    }

    function getTotalLands() external view returns (uint256) {
        return allLandIds.length;
    }

    function getTotalUsers() external view returns (uint256) {
        // This is a simplified count - in production, you'd maintain a separate counter
        return 0; // Would need to implement proper user counting
    }

    // Admin revocation functions
    function revokeUser(address _userAddress) external onlyAdmin {
        require(users[_userAddress].isRegistered, "User not registered");
        require(_userAddress != msg.sender, "Cannot revoke yourself");
        require(users[_userAddress].isActive, "User already revoked");
        
        users[_userAddress].isActive = false;
        
        emit UserRevoked(_userAddress);
    }

    function reinstateUser(address _userAddress) external onlyAdmin {
        require(users[_userAddress].isRegistered, "User not registered");
        require(!users[_userAddress].isActive, "User is already active");
        
        users[_userAddress].isActive = true;
        
        emit UserReinstated(_userAddress);
    }

    function isUserActive(address _userAddress) external view returns (bool) {
        return users[_userAddress].isActive;
    }

    // Delete land (admin only)
    function deleteLand(uint256 _landId) external onlyAdmin {
        require(lands[_landId].isRegistered, "Land not found");
        
        // Remove from owner's land list
        address owner = lands[_landId].currentOwner;
        _removeLandFromUser(owner, _landId);
        
        // Remove from all lands array
        for (uint256 i = 0; i < allLandIds.length; i++) {
            if (allLandIds[i] == _landId) {
                allLandIds[i] = allLandIds[allLandIds.length - 1];
                allLandIds.pop();
                break;
            }
        }
        
        // Delete the land
        delete lands[_landId];
        
        emit LandDeleted(_landId, owner);
    }
}
