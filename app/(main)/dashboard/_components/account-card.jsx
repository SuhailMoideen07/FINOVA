"use client";

import {
  updateDefaultAccount,
  deleteAccount,
  renameAccount,
} from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef(null);

  const { fn: updateDefaultFn } = useFetch(updateDefaultAccount);
  const { fn: deleteFn, data: deleteResult } = useFetch(deleteAccount);
  const { fn: renameFn, data: renameResult } = useFetch(renameAccount);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Account deleted successfully.");
      router.refresh();
    }
  }, [deleteResult, router]);

  useEffect(() => {
    if (renameResult?.success) {
      toast.success("Account renamed successfully.");
      router.refresh();
    }
  }, [renameResult, router]);


  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDefaultChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDefault) {
      toast.warning("You need at least one default account.");
      return;
    }

    updateDefaultFn(id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"?\n\nAll its transactions will also be deleted.`
      )
    )
      return;

    deleteFn(id);
  };

  const startRename = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTempName(name);
    setIsEditing(true);
  };

  const cancelRename = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTempName(name);
    setIsEditing(false);
  };

  const confirmRename = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tempName.trim() || tempName.trim() === name) {
      setIsEditing(false);
      return;
    }

    renameFn({ id, name: tempName.trim() });
    setIsEditing(false);
  };

  const handleInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTempName(e.target.value);
  };

  const handleNameClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTempName(name);
    setIsEditing(true);
  };

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <div
        onClick={!isEditing ? () => router.push(`/account/${id}`) : undefined}
        className="cursor-pointer"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditing ? (
              <div
                className="flex items-center gap-1 flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <input
                  ref={inputRef}
                  value={tempName}
                  onChange={handleInputChange}
                  onClick={handleInputClick}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") confirmRename(e);
                    if (e.key === "Escape") cancelRename(e);
                  }}
                  className="h-6 text-sm font-medium bg-background border-b border-muted outline-none flex-1 min-w-0 px-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={confirmRename}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={cancelRename}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <CardTitle
                className="text-sm font-medium capitalize truncate cursor-text"
                onClick={handleNameClick}
              >
                {name}
              </CardTitle>
            )}
          </div>

          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Switch checked={isDefault} onClick={handleDefaultChange} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={startRename}>
                  Rename Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AccountCard;
