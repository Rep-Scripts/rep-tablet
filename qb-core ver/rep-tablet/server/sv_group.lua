Core = exports['qb-core']:GetCoreObject()

local Players = {} -- Don't Touch if you don't know
local Groups = {}
-- Lấy tên của người chơi
local function GetPlayerCharName(src)
    local player = Core.Functions.GetPlayer(src)
    return player.PlayerData.charinfo.firstname.." "..player.PlayerData.charinfo.lastname
end

Core.Functions.CreateUseableItem("tablet",function(source)
    TriggerClientEvent('OpenTabletRep', source)
end)

-- Random Name khi có VPN
local function RandomName()
    local random1 = math.random(1, #Config.FirstName)
    local random2 = math.random(1, #Config.LastName)
    return Config.FirstName[random1].." "..Config.LastName[random2]
end

-- Gửi thông báo cho tất cả thành viên trong nhóm // Thay đổi loại thông báo tuỳ server
local function NotifyGroup(group, msg, type, time)
    if not group or not Groups[group] then return print("Group not found...") end
    for _, v in pairs(Groups[group].members) do
        TriggerClientEvent('QBQBCore:Notify', v.player, msg or "NO MSG", type or 'primary', time or 7500)
    end
end

exports("NotifyGroup", NotifyGroup)

-- Gửi thông báo Custom của điện thoại cho tất cả thành viên trong nhóm
local function pNotifyGroup(group, header, msg, icon, colour, length)
    if not group or not Groups[group] then return print("Group not found...") end
    for _, v in pairs(Groups[group].members) do
        TriggerClientEvent('rep-tablet:client:CustomNotification', v.player,
            header or "NO HEADER",
            msg or "NO MSG",
            icon or "fas fa-phone-square",
            colour or "#e84118",
            length or 7500
        )
    end
end

exports("pNotifyGroup", pNotifyGroup)

--Lấy Id của group bằng members
local function getGroupByMembers(src)
    if not Players[src] then return nil end
    for group, _ in pairs(Groups) do
        for _, v in pairs (Groups[group].members) do
            if v.player == src then
                return group
            end
        end
    end
end

exports("getGroupByMembers", getGroupByMembers)

-- Lấy id của các member trong group bằng id của group
local function getGroupMembers(id)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found")  end
    local temp = {}
    for _,v in pairs(Groups[id].members) do
        temp[#temp+1] = v.player
    end
    return temp
end

exports('getGroupMembers', getGroupMembers)

-- Lấy số lượng thành viên trong nhóm
local function getGroupSize(id)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    return Groups[id].users
end

exports('getGroupSize', getGroupSize)

-- Lấy id của trường nhóm bằng id của nhóm
local function GetGroupLeader(id)
      if not id then return print("Id not found") end
    if Groups[id] == nil then
        return
    end
    return Groups[id].leader
end

exports("GetGroupLeader", GetGroupLeader)

-- Trigger event cho các thành viên trong group
function GroupEvent(id, event, args)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    if not event then return print("no valid event was passed to GroupEvent") end
    local members = getGroupMembers(id)
    if members and #members > 0 then
        for i = 1, #members do
            if members[i] then
                if args ~= nil then
                    TriggerClientEvent(event, members[i], table.unpack(args))
                else
                    TriggerClientEvent(event, members[i])
                end
            end
        end
    end
end

exports("GroupEvent", GroupEvent)

-- Kiểm tra xem có phải trưởng nhóm hay không
local function isGroupLeader(src, id)
    if not id then return end
    local grouplead = GetGroupLeader(id)
    return grouplead == src or false
end

exports('isGroupLeader', isGroupLeader)

---- Set nhiệm vụ cho nhóm
local function setJobStatus(id, stages)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    Groups[id].status = true
    Groups[id].stage = stages or {}
    local m = getGroupMembers(id)
    if not m then return end
    for i=1, #m do
        if m[i] then
            TriggerClientEvent("rep-tablet:client:AddGroupStage", m[i], Groups[id])
        end
    end
end
exports('setJobStatus', setJobStatus)

-- Đổi trưởng nhóm
local function ChangeGroupLeader(id)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    local members = Groups[id].members
    local leader = GetGroupLeader(id)
    if #members > 1 then
        for i=1, #members do
            if members[i].player ~= leader then
                Groups[id].leader = members[i].player
                Groups[id].gName = members[i].name
                TriggerClientEvent('QBCore:Notify', members[i].player, "You have become the group leader", "success")
                return true
            end
        end
    end
    return false
end

-- Reset Stage của nhóm về không
local function resetJobStatus(id)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    Groups[id].status = false
    Groups[id].stage = {}
    local m = getGroupMembers(id)
    if not m then return end
    for i=1, #m do
        if m[i] then
            TriggerClientEvent('rep-tablet:client:AddGroupStage', m[i], Groups[id])
        end
    end
    TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
end

exports('resetJobStatus', resetJobStatus)

-- Xoá nhóm
local function DestroyGroup(id)
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    local members = getGroupMembers(id)
    if members and #members > 0 then
        for i = 1, #members do
            if members[i] then
                TriggerClientEvent('rep-tablet:client:UpdateGroupId', members[i], 0)
                TriggerClientEvent('rep-tablet:client:checkout', members[i])
                TriggerClientEvent('rep-tablet:client:closeAllNotification', members[i])
                Wait(100)
                TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', members[i], true)
                Players[members[i]] = false
            end
        end
    end
    if Config.JobCenter[Groups[id].job] then
        Config.JobCenter[Groups[id].job].count = Config.JobCenter[Groups[id].job].count - 1
    end
    TriggerClientEvent('rep-tablet:client:updateGroupJob', -1, Config.JobCenter)
    Groups[id] = nil
    TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
end

exports("DestroyGroup", DestroyGroup)

-- Đuổi người chơi khỏi nhóm
local function RemovePlayerFromGroup(src, id, disconnected)
    if not Players[src]  then return false end
    if not id then return print("Id not found") end
    if not Groups[id] then return print("Group :"..id.." not found") end
    local g = Groups[id].members
    for k,v in pairs(g) do
        if v.player == src then
            table.remove(Groups[id].members, k)
            Groups[id].users = Groups[id].users - 1
            Players[src] = false
            TriggerClientEvent('rep-tablet:client:UpdateGroupId', src, 0)
            pNotifyGroup(id, "Job Center", src.." has left the group", "fas fa-users", "#FFBF00", 7500)
            TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', src, true)
            if disconnected then 
                TriggerClientEvent("Core:Notify", src, "You have left the group", "error")
                TriggerClientEvent('rep-tablet:client:checkout', src)
            else
                TriggerClientEvent("Core:Notify", src, "You have left the group", "error")
            end
            if Groups[id].users <= 0 then
                DestroyGroup(id)
            else
                local m = getGroupMembers(id)
                if not m then return end
                for i=1, #m do
                    if m[i] then
                        TriggerClientEvent('rep-tablet:client:AddGroupStage', m[i], Groups[id])
                    end
                end
            end
            TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
            return
        end
    end
end

----EVENT-----
--Tạo nhóm
RegisterNetEvent("rep-tablet:server:createJobGroup", function(bool, job)
    local src = source
    local player = Core.Functions.GetPlayer(src)
    if Players[src] then TriggerClientEvent('QBCore:Notify', src, "You have already created a group", "error") return end
    Players[src] = true
    local ID = #Groups+1
    local name
    if bool then
        name = RandomName()
    else
        name = GetPlayerCharName(src)
    end
    Groups[ID] = {
        id = ID,
        status = false,
        job = job,
        gName = name,
        users = 1,
        leader = src,
        members = {
            {name = name, cid = player.PlayerData.citizenid, player = src, vpn = bool}
        },
        stage = {},
    }
    if Config.JobCenter[job] then
        Config.JobCenter[job].count = Config.JobCenter[job].count + 1
    else
        Config.JobCenter[job].count = 1
    end
    TriggerClientEvent('rep-tablet:client:updateGroupJob', -1, Config.JobCenter)
    TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
    TriggerClientEvent('rep-tablet:client:UpdateGroupId', src, ID)
    TriggerClientEvent('rep-tablet:client:AddGroupStage', src, Groups[ID])
end)

RegisterNetEvent("rep-tablet:server:updateVPN", function (result)
    local src = source
    if Players[src] then
        local id = getGroupByMembers(src)
        local leader = isGroupLeader(src, id)
        if result then
            local name = RandomName()
            if leader then
                Groups[id].gName = name
            end
            for _, v in pairs (Groups[id].members) do
                if v.player == src then
                    Groups[id].members[_].name = name
                    Groups[id].members[_].vpn = true
                end
            end
        else
            local name = GetPlayerCharName(src)
            if leader then
                Groups[id].gName = name
            end
            for _, v in pairs (Groups[id].members) do
                if v.player == src then
                    Groups[id].members[_].name = name
                    Groups[id].members[_].vpn = false
                end
            end
        end
        TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
        local m = getGroupMembers(id)
        if not m then return end
        for i=1, #m do
            if m[i] then
                TriggerClientEvent('rep-tablet:client:AddGroupStage', m[i], Groups[id])
            end
        end
    end
end)

RegisterNetEvent('rep-tablet:server:requestJoinGroup', function(data)
    local src = source
    if Players[src] then return TriggerClientEvent("QBCore:Notify", src, "You are already a part of a group", "error")  end
    if not data.id then
        return
    end
    if not Groups[data.id] then return TriggerClientEvent("QBCore:Notify", src, "That group doesn't exist", "error") end
    local leader = GetGroupLeader(data.id)
    TriggerClientEvent('rep-tablet:client:requestJoinGroup', leader, src)
end)

RegisterNetEvent('rep-tablet:client:requestJoin', function(target, bool)
    local src = source
    if not Groups[getGroupByMembers(src)] then return TriggerClientEvent("QBCore:Notify", target, "That group doesn't exist", "error") end
    if Groups[getGroupByMembers(src)].status == true then
        TriggerClientEvent("QBCore:Notify", target, "This group is already working", "error")
        return
    end
    if bool then
        if getGroupSize(getGroupByMembers(src)) < 6 then
            TriggerClientEvent('rep-tablet:client:Join', target, getGroupByMembers(src))
        else
            TriggerClientEvent("QBCore:Notify", target, getGroupByMembers(src).." is full", "error")
            TriggerClientEvent("QBCore:Notify", src, "Cannot recruit more people into the team", "error")
        end
    else
        TriggerClientEvent("QBCore:Notify", target, "The group leader "..getGroupByMembers(src).." has rejected you", "error")
    end
end)

RegisterNetEvent('rep-tablet:server:Join', function (id, vpn)
    local src = source
    local player = Core.Functions.GetPlayer(src)
    if Players[src] then return TriggerClientEvent('QBCore:Notify', src, "You are already a part of a group!", "success") end
    if not id then
        return
    end
    if not Groups[id] then return TriggerClientEvent("QBCore:Notify", src, "That group doesn't exist", "error") end
    if Groups[id].status == true then
        TriggerClientEvent("QBCore:Notify", src, "This group is already working", "error")
        return
    end
    local name
    if vpn then
        name = RandomName()
    else
        name = GetPlayerCharName(src)
    end
    pNotifyGroup(id, "Job Center", src.." has join the group", "fas fa-users", "#FFBF00", 7500)
    Groups[id].members[#Groups[id].members+1] = {name = name, cid = player.PlayerData.citizenid, player = src, vpn = vpn}
    Groups[id].users = Groups[id].users + 1
    Players[src] = true
    local m = getGroupMembers(id)
    if not m then return end
    for i=1, #m do
        if m[i] then
            TriggerClientEvent('rep-tablet:client:AddGroupStage', m[i], Groups[id])
        end
    end
    TriggerClientEvent('QBCore:Notify', src, "You joined the group "..id, "success")
    TriggerClientEvent('rep-tablet:client:RefreshGroupsApp', -1)
    TriggerClientEvent('rep-tablet:client:JoinSuccess',src)
end)

RegisterNetEvent('rep-tablet:server:LeaveGroup', function(id)
    local src = source
    if not id then
        return
    end
    if not Players[src] then return end
    if isGroupLeader(src, id) then
        local change = ChangeGroupLeader(id)
        if change then
            RemovePlayerFromGroup(src, id)
        else
            DestroyGroup(id)
        end
    else
        RemovePlayerFromGroup(src, id)
    end
end)

RegisterNetEvent('rep-tablet:server:DisbandGroup', function(id)
    local src = source
    if not Players[src] then return end
    DestroyGroup(id)
end)

RegisterNetEvent('rep-tablet:server:checkout', function(id)
    local src = source
    if not Players[src] then return end
    if isGroupLeader(src, id) then
        if Groups[id].status == true then
            DestroyGroup(id)
        else
            local change = ChangeGroupLeader(id)
            if change then
                RemovePlayerFromGroup(src, id, true)
            else
                DestroyGroup(id)
            end
        end
    else
        RemovePlayerFromGroup(src,id, true)
    end
end)

Core.Functions.CreateCallback('rep-tablet:callback:getGroupsApp', function(source, cb)
    local src = source
    if Players[src] then
        local id = getGroupByMembers(src)
        cb(true, Groups[id])
    else
        cb(false, Groups)
    end
end)

Core.Functions.CreateCallback('rep-tablet:callback:getGroupsJob', function(source, cb)
    cb(Config.JobCenter)
end)

Core.Functions.CreateCallback('rep-tablet:callback:CheckPlayerNames', function(source, cb, id)
    local src = source
    if Groups[id] == nil then
        TriggerClientEvent("QBCore:Notify", src, "That group doesn't exist", "error")
        cb(false)
    end
    cb(Groups[id].members)
end)

Core.Functions.CreateCallback('rep-tablet:callback:getDataGroup', function(_, cb)
    cb(Groups)
end)

AddEventHandler('playerDropped', function()
	local src = source
    local id = getGroupByMembers(src)
    if id then
        if isGroupLeader(src, id) then
            if Groups[id].status == true then
                DestroyGroup(id)
            else
                local change = ChangeGroupLeader(id)
                if change then
                    RemovePlayerFromGroup(src, id, true)
                else
                    DestroyGroup(id)
                end
            end
        else
            RemovePlayerFromGroup(src, id, true)
        end
    end
end)
